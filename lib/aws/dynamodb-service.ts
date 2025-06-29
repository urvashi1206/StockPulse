import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"

// Helper function to generate mock historical data
function generateMockHistoricalData(days: number, basePrice: number) {
  const data = []
  let currentPrice = basePrice

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

// Mock data storage - moved after the helper function
const mockDatabase = {
  stocks: {
    AAPL: {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 187.68,
      change: 1.23,
      changePercent: 0.66,
      volume: 28456789,
      lastUpdated: new Date().toISOString(),
    },
    MSFT: {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 403.78,
      change: -0.87,
      changePercent: -0.22,
      volume: 15678234,
      lastUpdated: new Date().toISOString(),
    },
    GOOGL: {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 142.56,
      change: 2.34,
      changePercent: 1.67,
      volume: 9876543,
      lastUpdated: new Date().toISOString(),
    },
    AMZN: {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 178.12,
      change: 3.45,
      changePercent: 1.98,
      volume: 12345678,
      lastUpdated: new Date().toISOString(),
    },
    TSLA: {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 248.42,
      change: -2.56,
      changePercent: -1.02,
      volume: 23456789,
      lastUpdated: new Date().toISOString(),
    },
    NVDA: {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 875.28,
      change: 15.42,
      changePercent: 1.79,
      volume: 45678901,
      lastUpdated: new Date().toISOString(),
    },
    META: {
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 485.32,
      change: -8.15,
      changePercent: -1.65,
      volume: 18765432,
      lastUpdated: new Date().toISOString(),
    },
  },
  users: {
    "user-1": {
      id: "user-1",
      email: "user@example.com",
      name: "John Doe",
      watchlist: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
      portfolio: [
        { symbol: "AAPL", shares: 10, avgPrice: 180.45 },
        { symbol: "MSFT", shares: 5, avgPrice: 390.2 },
        { symbol: "GOOGL", shares: 8, avgPrice: 135.75 },
      ],
      transactions: [
        {
          id: "tx-1",
          type: "BUY",
          symbol: "AAPL",
          shares: 10,
          price: 187.68,
          total: 1876.8,
          date: "2025-06-26T14:30:00Z",
        },
        {
          id: "tx-2",
          type: "SELL",
          symbol: "MSFT",
          shares: 5,
          price: 403.78,
          total: 2018.9,
          date: "2025-06-25T10:15:00Z",
        },
        {
          id: "tx-3",
          type: "BUY",
          symbol: "GOOGL",
          shares: 8,
          price: 142.56,
          total: 1140.48,
          date: "2025-06-24T16:45:00Z",
        },
        {
          id: "tx-4",
          type: "BUY",
          symbol: "TSLA",
          shares: 3,
          price: 248.42,
          total: 745.26,
          date: "2025-06-23T09:20:00Z",
        },
        {
          id: "tx-5",
          type: "SELL",
          symbol: "AMZN",
          shares: 4,
          price: 178.12,
          total: 712.48,
          date: "2025-06-22T13:10:00Z",
        },
      ],
    },
  },
  stockHistory: {
    AAPL: generateMockHistoricalData(365, 187.68),
    MSFT: generateMockHistoricalData(365, 403.78),
    GOOGL: generateMockHistoricalData(365, 142.56),
    AMZN: generateMockHistoricalData(365, 178.12),
    TSLA: generateMockHistoricalData(365, 248.42),
    NVDA: generateMockHistoricalData(365, 875.28),
    META: generateMockHistoricalData(365, 485.32),
  },
}

// Mock DynamoDB client setup
const mockDynamoDBClient = {
  send: async (command: any) => {
    console.log("🔄 DynamoDB command:", command.constructor.name)

    // Mock implementation for different command types
    if (command instanceof GetCommand) {
      return mockGetItem(command.input.TableName, command.input.Key)
    } else if (command instanceof PutCommand) {
      return mockPutItem(command.input.TableName, command.input.Item)
    } else if (command instanceof QueryCommand) {
      return mockQueryItems(command.input.TableName, command.input.KeyConditionExpression)
    } else if (command instanceof UpdateCommand) {
      return mockUpdateItem(
        command.input.TableName,
        command.input.Key,
        command.input.UpdateExpression,
        command.input.ExpressionAttributeValues,
      )
    }

    return { Item: null }
  },
}

// Mock DynamoDB operations
function mockGetItem(tableName: string, key: any) {
  console.log(`📖 Getting item from ${tableName} with key:`, key)

  if (tableName === "Stocks" && key.symbol) {
    const stock = mockDatabase.stocks[key.symbol as keyof typeof mockDatabase.stocks] || null
    console.log(`📖 Found stock:`, stock)
    return { Item: stock }
  } else if (tableName === "Users" && key.id) {
    const user = mockDatabase.users[key.id as keyof typeof mockDatabase.users] || null
    console.log(`📖 Found user:`, user)
    return { Item: user }
  }

  return { Item: null }
}

function mockPutItem(tableName: string, item: any) {
  console.log(`💾 Putting item in ${tableName}:`, item)

  if (tableName === "Stocks" && item.symbol) {
    ;(mockDatabase.stocks as any)[item.symbol] = { ...item, lastUpdated: new Date().toISOString() }
  } else if (tableName === "Users" && item.id) {
    ;(mockDatabase.users as any)[item.id] = { ...item }
  } else if (tableName === "Transactions" && item.id) {
    const userId = item.userId
    if ((mockDatabase.users as any)[userId]) {
      ;(mockDatabase.users as any)[userId].transactions = [
        item,
        ...((mockDatabase.users as any)[userId].transactions || []),
      ]
    }
  }

  return { Item: item }
}

function mockQueryItems(tableName: string, keyCondition: string) {
  console.log(`🔍 Querying ${tableName} with condition: ${keyCondition}`)

  if (tableName === "StockHistory" && keyCondition.includes("symbol")) {
    // Extract symbol from condition
    const symbolMatch = keyCondition.match(/symbol\s*=\s*['"]([^'"]+)['"]/)
    if (symbolMatch && symbolMatch[1]) {
      const symbol = symbolMatch[1]
      return { Items: mockDatabase.stockHistory[symbol as keyof typeof mockDatabase.stockHistory] || [] }
    }
  } else if (tableName === "Transactions" && keyCondition.includes("userId")) {
    // Extract userId from condition
    const userIdMatch = keyCondition.match(/userId\s*=\s*['"]([^'"]+)['"]/)
    if (userIdMatch && userIdMatch[1]) {
      const userId = userIdMatch[1]
      return { Items: (mockDatabase.users as any)[userId]?.transactions || [] }
    }
  }

  return { Items: [] }
}

function mockUpdateItem(tableName: string, key: any, updateExpression: string, expressionAttributeValues?: any) {
  console.log(`✏️ Updating item in ${tableName} with key:`, key)
  console.log(`✏️ Update expression: ${updateExpression}`)
  console.log(`✏️ Expression values:`, expressionAttributeValues)

  if (tableName === "Users" && key.id) {
    const userId = key.id
    if ((mockDatabase.users as any)[userId]) {
      // Parse the update expression and apply changes
      if (updateExpression.includes("SET portfolio = :portfolio") && expressionAttributeValues?.[":portfolio"]) {
        ;(mockDatabase.users as any)[userId].portfolio = expressionAttributeValues[":portfolio"]
        console.log(`✅ Updated portfolio for user ${userId}:`, expressionAttributeValues[":portfolio"])
      }

      if (updateExpression.includes("SET watchlist = :watchlist") && expressionAttributeValues?.[":watchlist"]) {
        ;(mockDatabase.users as any)[userId].watchlist = expressionAttributeValues[":watchlist"]
        console.log(`✅ Updated watchlist for user ${userId}:`, expressionAttributeValues[":watchlist"])
      }

      // Return the updated user data
      return { Attributes: (mockDatabase.users as any)[userId] }
    }
  }

  return { Attributes: null }
}

// Public API functions
export async function getStockPrice(symbol: string) {
  console.log(`🏷️ Getting stock price for: ${symbol}`)

  const command = new GetCommand({
    TableName: "Stocks",
    Key: { symbol },
  })

  const response = await mockDynamoDBClient.send(command)
  const result = response.Item || { error: "Stock not found" }
  console.log(`🏷️ Stock price result:`, result)
  return result
}

export async function getStockHistory(symbol: string, timeframe: string) {
  // Convert timeframe to days
  let days = 30
  switch (timeframe) {
    case "1D":
      days = 1
      break
    case "1W":
      days = 7
      break
    case "1M":
      days = 30
      break
    case "3M":
      days = 90
      break
    case "1Y":
      days = 365
      break
    case "5Y":
      days = 365 * 5
      break
  }

  // In a real implementation, this would query a specific range from DynamoDB
  // Here we'll just filter our mock data
  const allData = mockDatabase.stockHistory[symbol as keyof typeof mockDatabase.stockHistory] || []
  const filteredData = allData.slice(-days - 1)

  return filteredData
}

export async function getUserWatchlist(userId: string) {
  const command = new GetCommand({
    TableName: "Users",
    Key: { id: userId },
  })

  const response = await mockDynamoDBClient.send(command)
  if (!response.Item) {
    return { error: "User not found" }
  }

  // Get stock details for each symbol in watchlist
  const watchlistSymbols = response.Item.watchlist || []
  const watchlistDetails = await Promise.all(
    watchlistSymbols.map(async (symbol: string) => {
      const stockData = await getStockPrice(symbol)
      return stockData
    }),
  )

  return watchlistDetails.filter((item) => !item.error)
}

export async function updateUserWatchlist(userId: string, symbols: string[]) {
  // First get the user to make sure they exist
  const getCommand = new GetCommand({
    TableName: "Users",
    Key: { id: userId },
  })

  const userResponse = await mockDynamoDBClient.send(getCommand)
  if (!userResponse.Item) {
    return { error: "User not found" }
  }

  // Update the watchlist
  const updateCommand = new UpdateCommand({
    TableName: "Users",
    Key: { id: userId },
    UpdateExpression: "SET watchlist = :watchlist",
    ExpressionAttributeValues: {
      ":watchlist": symbols,
    },
    ReturnValues: "ALL_NEW",
  })

  const response = await mockDynamoDBClient.send(updateCommand)
  return {
    success: true,
    watchlist: symbols,
    lastUpdated: new Date().toISOString(),
  }
}

export async function getUserTransactions(userId: string) {
  const command = new QueryCommand({
    TableName: "Transactions",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ScanIndexForward: false, // to get most recent first
  })

  const response = await mockDynamoDBClient.send(command)
  return response.Items || []
}

export async function recordUserTransaction(userId: string, transaction: any) {
  console.log("💰 Recording transaction:", transaction)

  // Generate a transaction ID
  const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

  const transactionRecord = {
    id: transactionId,
    userId,
    ...transaction,
    date: new Date().toISOString(),
  }

  // Add transaction to mock database
  const command = new PutCommand({
    TableName: "Transactions",
    Item: transactionRecord,
  })

  await mockDynamoDBClient.send(command)

  // Update the user's portfolio based on the transaction
  console.log("🔄 About to update portfolio from transaction...")
  await updatePortfolioFromTransaction(userId, transactionRecord)

  return {
    success: true,
    transactionId,
    timestamp: new Date().toISOString(),
  }
}

export async function getUserPortfolio(userId: string) {
  console.log("📊 Getting portfolio for user:", userId)

  const command = new GetCommand({
    TableName: "Users",
    Key: { id: userId },
  })

  const response = await mockDynamoDBClient.send(command)
  if (!response.Item) {
    console.log("❌ User not found")
    return { error: "User not found" }
  }

  const portfolio = response.Item.portfolio || []
  console.log("📊 Raw portfolio data:", portfolio)

  // Enrich portfolio with current prices
  const enrichedPortfolio = await Promise.all(
    portfolio.map(async (position: any) => {
      console.log(`📊 Processing position for ${position.symbol}`)
      const stockData = await getStockPrice(position.symbol)
      if (stockData.error) {
        console.log(`❌ Stock data not found for ${position.symbol}`)
        return null
      }

      const currentValue = stockData.price * position.shares
      const costBasis = position.avgPrice * position.shares
      const profit = currentValue - costBasis
      const profitPercent = (profit / costBasis) * 100

      const enrichedPosition = {
        ...position,
        currentPrice: stockData.price,
        currentValue,
        costBasis,
        profit,
        profitPercent,
      }

      console.log(`📊 Enriched position for ${position.symbol}:`, enrichedPosition)
      return enrichedPosition
    }),
  )

  const validPortfolio = enrichedPortfolio.filter((item) => item !== null)
  console.log("📊 Final enriched portfolio:", validPortfolio)

  return validPortfolio
}

export async function updateUserPortfolio(userId: string, portfolio: any[]) {
  console.log("💾 Updating portfolio for user:", userId, "with data:", portfolio)

  const command = new UpdateCommand({
    TableName: "Users",
    Key: { id: userId },
    UpdateExpression: "SET portfolio = :portfolio",
    ExpressionAttributeValues: {
      ":portfolio": portfolio,
    },
    ReturnValues: "ALL_NEW",
  })

  const response = await mockDynamoDBClient.send(command)
  console.log("💾 Portfolio update response:", response)

  return {
    success: true,
    portfolio,
    lastUpdated: new Date().toISOString(),
  }
}

// Helper function to update portfolio when a transaction is recorded
async function updatePortfolioFromTransaction(userId: string, transaction: any) {
  try {
    console.log("🔄 Starting portfolio update from transaction:", transaction)

    // Get current user data using the API (not direct access)
    const getUserCommand = new GetCommand({
      TableName: "Users",
      Key: { id: userId },
    })

    const userResponse = await mockDynamoDBClient.send(getUserCommand)
    if (!userResponse.Item) {
      console.error("❌ User not found for portfolio update")
      return
    }

    const currentPortfolio = [...(userResponse.Item.portfolio || [])]
    console.log("📊 Current portfolio before update:", currentPortfolio)

    // Find if the stock already exists in portfolio
    const existingPositionIndex = currentPortfolio.findIndex((p: any) => p.symbol === transaction.symbol)
    console.log(`🔍 Existing position index for ${transaction.symbol}:`, existingPositionIndex)

    if (transaction.type === "BUY") {
      if (existingPositionIndex >= 0) {
        // Update existing position
        const existingPosition = currentPortfolio[existingPositionIndex]
        console.log("📊 Updating existing position:", existingPosition)

        const totalShares = existingPosition.shares + transaction.shares
        const totalCost = existingPosition.shares * existingPosition.avgPrice + transaction.shares * transaction.price

        currentPortfolio[existingPositionIndex] = {
          symbol: transaction.symbol,
          shares: totalShares,
          avgPrice: Number.parseFloat((totalCost / totalShares).toFixed(2)),
        }
        console.log("✅ Updated existing position:", currentPortfolio[existingPositionIndex])
      } else {
        // Add new position
        const newPosition = {
          symbol: transaction.symbol,
          shares: transaction.shares,
          avgPrice: transaction.price,
        }
        currentPortfolio.push(newPosition)
        console.log("✅ Added new position:", newPosition)
      }
    } else if (transaction.type === "SELL") {
      if (existingPositionIndex >= 0) {
        // Update existing position
        const existingPosition = currentPortfolio[existingPositionIndex]
        const newShares = existingPosition.shares - transaction.shares

        if (newShares <= 0) {
          // Remove position if shares become 0 or negative
          currentPortfolio.splice(existingPositionIndex, 1)
          console.log("✅ Removed position for", transaction.symbol)
        } else {
          // Update shares count
          currentPortfolio[existingPositionIndex] = {
            ...existingPosition,
            shares: newShares,
          }
          console.log("✅ Updated position shares:", currentPortfolio[existingPositionIndex])
        }
      }
    }

    console.log("📊 Portfolio after transaction processing:", currentPortfolio)

    // Update the portfolio using the UpdateCommand
    const updateResult = await updateUserPortfolio(userId, currentPortfolio)
    console.log("✅ Portfolio update completed:", updateResult)
  } catch (error) {
    console.error("❌ Error updating portfolio from transaction:", error)
    throw error
  }
}
