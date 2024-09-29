import { NextResponse } from "next/server";

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = 120000
): Promise<Response> => {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = "https://manual-marti-bhaulik-70305df9.koyeb.app/query";
    console.log("Backend URL:", backendUrl);
    console.log("Body:", JSON.stringify(body));

    const response = await fetchWithTimeout(
      backendUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      180000 // 3 minute timeout
    );

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
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
