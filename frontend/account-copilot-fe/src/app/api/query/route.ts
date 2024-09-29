import { NextResponse } from "next/server";

const fetchWithCustomTimeout = (
  url: string,
  options: RequestInit,
  timeout?: number
): Promise<Response> => {
  if (timeout === undefined) {
    return fetch(url, options);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(id);
      return response;
    })
    .catch((error) => {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    });
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeout: number,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchWithCustomTimeout(url, options, timeout);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry attempt ${i + 1} of ${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  throw new Error("Max retries reached");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = "https://manual-marti-bhaulik-70305df9.koyeb.app/query";
    console.log("Backend URL:", backendUrl);
    console.log("Request Body:", JSON.stringify(body));

    console.log(`Sending request to ${backendUrl}`);
    const startTime = Date.now();

    const response = await fetchWithRetry(
      backendUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      30000, // 30 seconds timeout
      3 // 3 retry attempts
    );

    console.log(`Request completed in ${Date.now() - startTime}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Backend API request failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing query:", error);
    let errorMessage = "Failed to process query";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes("timed out")) {
        statusCode = 504; // Gateway Timeout
      } else if (errorMessage.includes("Failed to fetch")) {
        statusCode = 503; // Service Unavailable
      }
    }

    console.error(
      `Error details: Status ${statusCode}, Message: ${errorMessage}`
    );
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
