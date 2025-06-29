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
  },
}

// Mock DynamoDB client setup
// In a real implementation, this would be configured with AWS credentials
const mockDynamoDBClient = {
  send: async (command: any) => {
    console.log("DynamoDB command:", command.constructor.name)

    // Mock implementation for different command types
    if (command instanceof GetCommand) {
      return mockGetItem(command.input.TableName, command.input.Key)
    } else if (command instanceof PutCommand) {
      return mockPutItem(command.input.TableName, command.input.Item)
    } else if (command instanceof QueryCommand) {
      return mockQueryItems(command.input.TableName, command.input.KeyConditionExpression)
    } else if (command instanceof UpdateCommand) {
      return mockUpdateItem(command.input.TableName, command.input.Key, command.input.UpdateExpression)
    }

    return { Item: null }
  },
}

// Mock DynamoDB operations
function mockGetItem(tableName: string, key: any) {
  console.log(`Getting item from ${tableName} with key:`, key)

  if (tableName === "Stocks" && key.symbol) {
    return { Item: mockDatabase.stocks[key.symbol as keyof typeof mockDatabase.stocks] || null }
  } else if (tableName === "Users" && key.id) {
    return { Item: mockDatabase.users[key.id as keyof typeof mockDatabase.users] || null }
  }

  return { Item: null }
}

function mockPutItem(tableName: string, item: any) {
  console.log(`Putting item in ${tableName}:`, item)

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
  console.log(`Querying ${tableName} with condition: ${keyCondition}`)

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

function mockUpdateItem(tableName: string, key: any, updateExpression: string) {
  console.log(`Updating item in ${tableName} with key:`, key)
  console.log(`Update expression: ${updateExpression}`)

  if (tableName === "Users" && key.id) {
    // Very simplified update logic - in real implementation would parse the update expression
    return { Attributes: (mockDatabase.users as any)[key.id] }
  }

  return { Attributes: null }
}

// Public API functions
export async function getStockPrice(symbol: string) {
  const command = new GetCommand({
    TableName: "Stocks",
    Key: { symbol },
  })

  const response = await mockDynamoDBClient.send(command)
  return response.Item || { error: "Stock not found" }
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
  // Generate a transaction ID
  const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

  const command = new PutCommand({
    TableName: "Transactions",
    Item: {
      id: transactionId,
      userId,
      ...transaction,
      date: new Date().toISOString(),
    },
  })

  await mockDynamoDBClient.send(command)

  // Update the user's portfolio based on the transaction
  await updatePortfolioFromTransaction(userId, {
    id: transactionId,
    userId,
    ...transaction,
  })

  return {
    success: true,
    transactionId,
    timestamp: new Date().toISOString(),
  }
}

export async function getUserPortfolio(userId: string) {
  const command = new GetCommand({
    TableName: "Users",
    Key: { id: userId },
  })

  const response = await mockDynamoDBClient.send(command)
  if (!response.Item) {
    return { error: "User not found" }
  }

  const portfolio = response.Item.portfolio || []

  // Enrich portfolio with current prices
  const enrichedPortfolio = await Promise.all(
    portfolio.map(async (position: any) => {
      const stockData = await getStockPrice(position.symbol)
      const currentValue = stockData.price * position.shares
      const costBasis = position.avgPrice * position.shares
      const profit = currentValue - costBasis
      const profitPercent = (profit / costBasis) * 100

      return {
        ...position,
        currentPrice: stockData.price,
        currentValue,
        costBasis,
        profit,
        profitPercent,
      }
    }),
  )

  return enrichedPortfolio
}

export async function updateUserPortfolio(userId: string, portfolio: any[]) {
  const command = new UpdateCommand({
    TableName: "Users",
    Key: { id: userId },
    UpdateExpression: "SET portfolio = :portfolio",
    ExpressionAttributeValues: {
      ":portfolio": portfolio,
    },
    ReturnValues: "ALL_NEW",
  })

  await mockDynamoDBClient.send(command)

  return {
    success: true,
    portfolio,
    lastUpdated: new Date().toISOString(),
  }
}

// Helper function to update portfolio when a transaction is recorded
async function updatePortfolioFromTransaction(userId: string, transaction: any) {
  // Get current portfolio
  const currentPortfolio = await getUserPortfolio(userId)
  if ("error" in currentPortfolio) {
    return
  }

  const portfolio = Array.isArray(currentPortfolio) ? currentPortfolio : []

  // Find if the stock already exists in portfolio
  const existingPosition = portfolio.find((p: any) => p.symbol === transaction.symbol)

  if (transaction.type === "BUY") {
    if (existingPosition) {
      // Update existing position
      const totalShares = existingPosition.shares + transaction.shares
      const totalCost = existingPosition.shares * existingPosition.avgPrice + transaction.shares * transaction.price
      existingPosition.shares = totalShares
      existingPosition.avgPrice = totalCost / totalShares
    } else {
      // Add new position
      portfolio.push({
        symbol: transaction.symbol,
        shares: transaction.shares,
        avgPrice: transaction.price,
      })
    }
  } else if (transaction.type === "SELL") {
    if (existingPosition) {
      // Update existing position
      existingPosition.shares -= transaction.shares

      // Remove position if shares become 0
      if (existingPosition.shares <= 0) {
        const index = portfolio.indexOf(existingPosition)
        portfolio.splice(index, 1)
      }
    }
  }

  // Update the portfolio
  await updateUserPortfolio(userId, portfolio)
}
