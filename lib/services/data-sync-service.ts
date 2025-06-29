/**
 * Data Synchronization Service
 * This service handles real-time data updates and synchronization
 */

import { updateStockPrice, getAllStocks, saveStockHistoryPoint } from "../aws/real-dynamodb-service"
import { fetchStockData } from "../external-apis/stock-api"

// Update all stock prices
export async function updateAllStockPrices(): Promise<void> {
  try {
    console.log("🔄 Starting stock price update...")

    const stocks = await getAllStocks()
    const updatePromises = stocks.map(async (stock) => {
      try {
        const freshData = await fetchStockData(stock.symbol)
        await updateStockPrice(freshData)

        // Also save as historical data point
        await saveStockHistoryPoint(stock.symbol, {
          price: freshData.price,
          volume: freshData.volume,
        })

        console.log(`✓ Updated ${stock.symbol}: $${freshData.price}`)
      } catch (error) {
        console.error(`✗ Failed to update ${stock.symbol}:`, error.message)
      }
    })

    await Promise.all(updatePromises)
    console.log("✅ Stock price update completed")
  } catch (error) {
    console.error("❌ Error updating stock prices:", error)
    throw error
  }
}

// Schedule regular updates
export function startDataSyncScheduler(): void {
  console.log("🚀 Starting data sync scheduler...")

  // Update stock prices every 5 minutes during market hours
  const updateInterval = 5 * 60 * 1000 // 5 minutes

  setInterval(async () => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Only update during market hours (9:30 AM - 4:00 PM EST, Monday-Friday)
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 16) {
      try {
        await updateAllStockPrices()
      } catch (error) {
        console.error("Scheduled update failed:", error)
      }
    }
  }, updateInterval)

  console.log("✅ Data sync scheduler started")
}
