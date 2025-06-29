/**
 * Real Data Seeding Script
 * This script populates the database with real stock market data
 */

import { updateStockPrice, createUser, saveStockHistoryPoint } from "../lib/aws/real-dynamodb-service"
import { fetchStockData, fetchHistoricalDataFromAlphaVantage } from "../lib/external-apis/stock-api"
import { uploadHistoricalData } from "../lib/aws/real-s3-service"

// Popular stocks to seed
const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "JPM",
  "V",
  "WMT",
  "JNJ",
  "PG",
  "UNH",
  "HD",
  "MA",
  "DIS",
  "PYPL",
  "ADBE",
  "NFLX",
  "CRM",
]

// Seed stock data
async function seedStockData() {
  console.log("🔄 Seeding stock data...")

  for (const symbol of POPULAR_STOCKS) {
    try {
      console.log(`Fetching data for ${symbol}...`)

      // Fetch current stock data
      const stockData = await fetchStockData(symbol)

      // Save to DynamoDB
      await updateStockPrice({
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        volume: stockData.volume,
        lastUpdated: new Date().toISOString(),
      })

      console.log(`✓ Saved current data for ${symbol}`)

      // Add a small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`✗ Error seeding data for ${symbol}:`, error.message)
    }
  }
}

// Seed historical data
async function seedHistoricalData() {
  console.log("🔄 Seeding historical data...")

  for (const symbol of POPULAR_STOCKS.slice(0, 5)) {
    // Limit to first 5 to avoid API limits
    try {
      console.log(`Fetching historical data for ${symbol}...`)

      // Fetch historical data
      const historicalData = await fetchHistoricalDataFromAlphaVantage(symbol, "daily")

      // Save to S3
      await uploadHistoricalData(symbol, "daily", historicalData)

      // Save recent data points to DynamoDB for quick access
      const recentData = historicalData.slice(-30) // Last 30 days

      for (const dataPoint of recentData) {
        await saveStockHistoryPoint(symbol, {
          date: dataPoint.date,
          price: dataPoint.close,
          volume: dataPoint.volume,
          open: dataPoint.open,
          high: dataPoint.high,
          low: dataPoint.low,
        })
      }

      console.log(`✓ Saved historical data for ${symbol}`)

      // Add delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`✗ Error seeding historical data for ${symbol}:`, error.message)
    }
  }
}

// Seed user data
async function seedUserData() {
  console.log("🔄 Seeding user data...")

  const users = [
    {
      id: "user-1",
      email: "john.doe@example.com",
      name: "John Doe",
    },
    {
      id: "user-2",
      email: "jane.smith@example.com",
      name: "Jane Smith",
    },
    {
      id: "user-3",
      email: "bob.johnson@example.com",
      name: "Bob Johnson",
    },
  ]

  for (const userData of users) {
    try {
      await createUser(userData)
      console.log(`✓ Created user: ${userData.name}`)
    } catch (error) {
      console.error(`✗ Error creating user ${userData.name}:`, error.message)
    }
  }
}

// Main seeding function
async function seedRealData() {
  console.log("🌱 Starting real data seeding process...")
  console.log("=".repeat(50))

  try {
    await seedUserData()
    console.log()

    await seedStockData()
    console.log()

    await seedHistoricalData()
    console.log()

    console.log("=".repeat(50))
    console.log("✅ Real data seeding completed successfully!")
    console.log()
    console.log("Your database now contains:")
    console.log(`- ${POPULAR_STOCKS.length} stocks with current market data`)
    console.log("- Historical data for the top 5 stocks")
    console.log("- 3 sample users")
    console.log()
    console.log("You can now use the application with real market data!")
  } catch (error) {
    console.error("❌ Error during data seeding:", error)
    process.exit(1)
  }
}

// Run the seeding
if (require.main === module) {
  seedRealData()
}

export { seedRealData }
