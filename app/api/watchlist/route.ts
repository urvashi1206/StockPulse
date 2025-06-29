import { type NextRequest, NextResponse } from "next/server"
import { getUserWatchlist, updateUserWatchlist } from "@/lib/aws/dynamodb-service"

// API route to get user's watchlist
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const watchlist = await getUserWatchlist(userId)
    return NextResponse.json(watchlist)
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

// API route to update user's watchlist
export async function POST(request: NextRequest) {
  try {
    const { userId, symbols } = await request.json()

    if (!userId || !symbols) {
      return NextResponse.json({ error: "User ID and symbols are required" }, { status: 400 })
    }

    const result = await updateUserWatchlist(userId, symbols)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating watchlist:", error)
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 })
  }
}
