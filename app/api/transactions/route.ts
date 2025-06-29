import { type NextRequest, NextResponse } from "next/server"
import { getUserTransactions, recordUserTransaction } from "@/lib/aws/dynamodb-service"

// API route to get user's transaction history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const transactions = await getUserTransactions(userId)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// API route to record a new transaction
export async function POST(request: NextRequest) {
  try {
    const { userId, transaction } = await request.json()

    if (!userId || !transaction) {
      return NextResponse.json({ error: "User ID and transaction details are required" }, { status: 400 })
    }

    const result = await recordUserTransaction(userId, transaction)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error recording transaction:", error)
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
  }
}
