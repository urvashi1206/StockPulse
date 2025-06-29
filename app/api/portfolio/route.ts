import { type NextRequest, NextResponse } from "next/server"
import { getUserPortfolio, updateUserPortfolio } from "@/lib/aws/dynamodb-service"

// API route to get user's portfolio
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const portfolio = await getUserPortfolio(userId)
    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

// API route to update user's portfolio
export async function POST(request: NextRequest) {
  try {
    const { userId, portfolio } = await request.json()

    if (!userId || !portfolio) {
      return NextResponse.json({ error: "User ID and portfolio details are required" }, { status: 400 })
    }

    const result = await updateUserPortfolio(userId, portfolio)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 })
  }
}
