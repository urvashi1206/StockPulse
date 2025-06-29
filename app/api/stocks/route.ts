import { type NextRequest, NextResponse } from "next/server"
import { getStockPrice, getStockHistory } from "@/lib/aws/dynamodb-service"

// API route to fetch real-time stock prices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    const stockData = await getStockPrice(symbol)
    return NextResponse.json(stockData)
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

// API route to fetch historical stock data
export async function POST(request: NextRequest) {
  try {
    const { symbol, timeframe } = await request.json()

    if (!symbol || !timeframe) {
      return NextResponse.json({ error: "Symbol and timeframe are required" }, { status: 400 })
    }

    const historicalData = await getStockHistory(symbol, timeframe)
    return NextResponse.json(historicalData)
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}
