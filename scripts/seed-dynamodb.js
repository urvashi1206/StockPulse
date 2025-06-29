/**
 * This script would be used to seed DynamoDB with initial data
 * In a real implementation, this would use the AWS SDK to create tables and load data
 */

// Mock function to create DynamoDB tables
async function createTables() {
  console.log("Creating DynamoDB tables...")

  // Create Stocks table
  console.log("Creating Stocks table...")
  // AWS SDK code to create table would go here

  // Create Users table
  console.log("Creating Users table...")
  // AWS SDK code to create table would go here

  // Create Transactions table
  console.log("Creating Transactions table...")
  // AWS SDK code to create table would go here

  console.log("Tables created successfully!")
}

// Mock function to seed stock data
async function seedStockData() {
  console.log("Seeding stock data...")

  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 187.68, change: 1.23, changePercent: 0.66, volume: 28456789 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 403.78, change: -0.87, changePercent: -0.22, volume: 15678234 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.56, change: 2.34, changePercent: 1.67, volume: 9876543 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.12, change: 3.45, changePercent: 1.98, volume: 12345678 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -2.56, changePercent: -1.02, volume: 23456789 },
  ]

  // AWS SDK code to put items in DynamoDB would go here

  console.log("Stock data seeded successfully!")
}

// Mock function to seed user data
async function seedUserData() {
  console.log("Seeding user data...")

  const users = [
    {
      id: "user-1",
      email: "user@example.com",
      name: "John Doe",
      watchlist: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
      portfolio: [
        { symbol: "AAPL", shares: 10, avgPrice: 180.45 },
        { symbol: "MSFT", shares: 5, avgPrice: 390.2 },
        { symbol: "GOOGL", shares: 8, avgPrice: 135.75 },
      ],
    },
  ]

  // AWS SDK code to put items in DynamoDB would go here

  console.log("User data seeded successfully!")
}

// Mock function to seed transaction data
async function seedTransactionData() {
  console.log("Seeding transaction data...")

  const transactions = [
    {
      id: "tx-1",
      userId: "user-1",
      type: "BUY",
      symbol: "AAPL",
      shares: 10,
      price: 187.68,
      total: 1876.8,
      date: "2025-06-26T14:30:00Z",
    },
    {
      id: "tx-2",
      userId: "user-1",
      type: "SELL",
      symbol: "MSFT",
      shares: 5,
      price: 403.78,
      total: 2018.9,
      date: "2025-06-25T10:15:00Z",
    },
    {
      id: "tx-3",
      userId: "user-1",
      type: "BUY",
      symbol: "GOOGL",
      shares: 8,
      price: 142.56,
      total: 1140.48,
      date: "2025-06-24T16:45:00Z",
    },
    {
      id: "tx-4",
      userId: "user-1",
      type: "BUY",
      symbol: "TSLA",
      shares: 3,
      price: 248.42,
      total: 745.26,
      date: "2025-06-23T09:20:00Z",
    },
    {
      id: "tx-5",
      userId: "user-1",
      type: "SELL",
      symbol: "AMZN",
      shares: 4,
      price: 178.12,
      total: 712.48,
      date: "2025-06-22T13:10:00Z",
    },
  ]

  // AWS SDK code to put items in DynamoDB would go here

  console.log("Transaction data seeded successfully!")
}

// Main function to run the script
async function main() {
  try {
    await createTables()
    await seedStockData()
    await seedUserData()
    await seedTransactionData()

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the script
main()
