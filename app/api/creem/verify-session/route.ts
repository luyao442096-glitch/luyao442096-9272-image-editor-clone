import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const creemApiKey = process.env.CREEM_API_KEY
    if (!creemApiKey) {
      return NextResponse.json(
        { error: "Creem API key not configured" },
        { status: 500 }
      )
    }

    // Verify the session with Creem API
    // 注意：根据 Creem API 文档，查询 checkout session 的端点可能是 /v1/checkouts/{id}
    const creemResponse = await fetch(
      `https://api.creem.io/v1/checkouts/${sessionId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": creemApiKey,
        },
      }
    )

    if (!creemResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify session" },
        { status: 500 }
      )
    }

    const sessionData = await creemResponse.json()

    // Check if payment was successful
    if (sessionData.status === "completed" || sessionData.payment_status === "paid") {
      return NextResponse.json({
        verified: true,
        session: sessionData,
      })
    }

    return NextResponse.json({
      verified: false,
      session: sessionData,
    })
  } catch (error) {
    console.error("Verify session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
