import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACK_END_KEY || "http://0.0.0.0:8000";
    console.log("Backend URL:", backendUrl);
    console.log("Body:", JSON.stringify(body));
    const response = await fetch(`${backendUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process query",
      },
      { status: 500 }
    );
  }
}
