"use server"

import { revalidatePath } from "next/cache"
import { getStockPrice, getStockHistory } from "@/lib/aws/dynamodb-service"
import { queryHistoricalDataWithAnalytics, analyzeStockPerformance } from "@/lib/aws/athena-service"

// Server action to fetch real-time stock data
export async function fetchStockData(symbol: string) {
  try {
    const stockData = await getStockPrice(symbol)
    return { success: true, data: stockData }
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return { success: false, error: "Failed to fetch stock data" }
  }
}

// Server action to fetch historical stock data
export async function fetchHistoricalData(symbol: string, timeframe: string) {
  try {
    const historicalData = await getStockHistory(symbol, timeframe)
    return { success: true, data: historicalData }
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return { success: false, error: "Failed to fetch historical data" }
  }
}

// Server action to fetch historical data with analytics
export async function fetchHistoricalDataWithAnalytics(symbol: string, timeframe: string, metrics: string[] = []) {
  try {
    const analyticsData = await queryHistoricalDataWithAnalytics(symbol, timeframe, metrics)
    return { success: true, data: analyticsData }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return { success: false, error: "Failed to fetch analytics data" }
  }
}

// Server action to analyze stock performance
export async function fetchStockPerformance(symbol: string, startDate: string, endDate: string) {
  try {
    const performanceData = await analyzeStockPerformance(symbol, startDate, endDate)
    return { success: true, data: performanceData }
  } catch (error) {
    console.error("Error analyzing stock performance:", error)
    return { success: false, error: "Failed to analyze stock performance" }
  }
}

// Server action to search for stocks
export async function searchStocks(query: string) {
  try {
    // Mock stock search results
    const mockStocks = [
      { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
      { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
      { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
      { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
      { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
      { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
      { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
      { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
    ]

    // Filter based on query
    const results = mockStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase()),
    )

    return { success: true, data: results }
  } catch (error) {
    console.error("Error searching stocks:", error)
    return { success: false, error: "Failed to search stocks" }
  }
}

// Server action to refresh dashboard data
export async function refreshDashboardData() {
  try {
    // Revalidate the dashboard page to refresh data
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error refreshing dashboard:", error)
    return { success: false, error: "Failed to refresh dashboard" }
  }
}
