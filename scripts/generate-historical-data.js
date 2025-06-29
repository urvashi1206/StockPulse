/**
 * This script would be used to generate historical stock data and upload to S3
 * In a real implementation, this would use the AWS SDK to upload data to S3
 */

// Mock function to generate historical data for a stock
function generateHistoricalData(symbol, days, startPrice) {
  console.log(`Generating ${days} days of historical data for ${symbol}...`)

  const data = []
  let currentPrice = startPrice

  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Random price change between -2% and +2%
    const change = (Math.random() * 4 - 2) / 100
    currentPrice = currentPrice * (1 + change)

    data.push({
      date: date.toISOString(),
      price: Number.parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })
  }

  return data
}

// Mock function to upload data to S3
async function uploadToS3(symbol, data) {
  console.log(`Uploading historical data for ${symbol} to S3...`)

  // AWS SDK code to upload to S3 would go here

  console.log(`Data for ${symbol} uploaded successfully!`)
}

// Main function to run the script
async function main() {
  try {
    const stocks = [
      { symbol: "AAPL", startPrice: 180 },
      { symbol: "MSFT", startPrice: 400 },
      { symbol: "GOOGL", startPrice: 140 },
      { symbol: "AMZN", startPrice: 175 },
      { symbol: "TSLA", startPrice: 250 },
    ]

    // Generate 5 years of daily data
    const days = 365 * 5

    for (const stock of stocks) {
      const data = generateHistoricalData(stock.symbol, days, stock.startPrice)
      await uploadToS3(stock.symbol, data)
    }

    console.log("Historical data generation completed!")
  } catch (error) {
    console.error("Error generating historical data:", error)
    process.exit(1)
  }
}

// Run the script
main()
