import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const CREEM_API_KEY = process.env.CREEM_API_KEY || "creem_test_3dlkEtyc4co7RWiLPFNHAE"
    const PRODUCT_ID = "prod_3IjLmvk9PCT9GeVtWmtiNL"

    console.log("🧪 Testing Creem API Key...")
    console.log("API Key:", CREEM_API_KEY.substring(0, 20) + "...")
    console.log("Product ID:", PRODUCT_ID)

    // 测试 1: 尝试创建一个最小的 checkout session
    const testRequestBody = {
      product_id: PRODUCT_ID,
      success_url: "https://www.zlseren.online/pricing/success",
    }

    console.log("📤 Test Request:", {
      url: "https://api.creem.io/v1/checkouts",
      method: "POST",
      body: testRequestBody,
    })

    const response = await fetch("https://api.creem.io/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CREEM_API_KEY,
      },
      body: JSON.stringify(testRequestBody),
    })

    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    console.log("📥 Test Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "API Key is valid! ✅",
        details: {
          status: response.status,
          checkoutId: responseData.id,
          checkoutUrl: responseData.checkout_url || responseData.url,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "API Key test failed ❌",
          details: {
            status: response.status,
            statusText: response.statusText,
            error: responseData,
          },
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("❌ Test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Test failed with exception",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
