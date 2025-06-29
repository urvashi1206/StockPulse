/**
 * Real DynamoDB Service Implementation
 * This replaces the mock service with actual AWS DynamoDB operations
 */

import { GetCommand, PutCommand, QueryCommand, UpdateCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, TABLES } from "./config"

// Types
interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

interface UserData {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  userId: string
  type: "BUY" | "SELL"
  symbol: string
  shares: number
  price: number
  total: number
  date: string
}

interface WatchlistItem {
  userId: string
  symbol: string
  addedAt: string
}

// Stock Operations
export async function getStockPrice(symbol: string): Promise<StockData | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.STOCKS,
      Key: { symbol },
    })

    const response = await docClient.send(command)
    return (response.Item as StockData) || null
  } catch (error) {
    console.error("Error getting stock price:", error)
    throw new Error(`Failed to get stock price for ${symbol}`)
  }
}

export async function updateStockPrice(stockData: StockData): Promise<void> {
  try {
    const command = new PutCommand({
      TableName: TABLES.STOCKS,
      Item: {
        ...stockData,
        lastUpdated: new Date().toISOString(),
      },
    })

    await docClient.send(command)
  } catch (error) {
    console.error("Error updating stock price:", error)
    throw new Error(`Failed to update stock price for ${stockData.symbol}`)
  }
}

export async function getAllStocks(): Promise<StockData[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.STOCKS,
    })

    const response = await docClient.send(command)
    return (response.Items as StockData[]) || []
  } catch (error) {
    console.error("Error getting all stocks:", error)
    throw new Error("Failed to get all stocks")
  }
}

// User Operations
export async function getUser(userId: string): Promise<UserData | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: userId },
    })

    const response = await docClient.send(command)
    return (response.Item as UserData) || null
  } catch (error) {
    console.error("Error getting user:", error)
    throw new Error(`Failed to get user ${userId}`)
  }
}

export async function createUser(userData: Omit<UserData, "createdAt" | "updatedAt">): Promise<UserData> {
  try {
    const now = new Date().toISOString()
    const user: UserData = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    }

    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
    })

    await docClient.send(command)
    return user
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function updateUser(userId: string, updates: Partial<UserData>): Promise<UserData> {
  try {
    const updateExpression = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "id") {
        updateExpression.push(`#${key} = :${key}`)
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = value
      }
    }

    updateExpression.push("#updatedAt = :updatedAt")
    expressionAttributeNames["#updatedAt"] = "updatedAt"
    expressionAttributeValues[":updatedAt"] = new Date().toISOString()

    const command = new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { id: userId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })

    const response = await docClient.send(command)
    return response.Attributes as UserData
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error(`Failed to update user ${userId}`)
  }
}

// Transaction Operations
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false, // Most recent first
    })

    const response = await docClient.send(command)
    return (response.Items as Transaction[]) || []
  } catch (error) {
    console.error("Error getting user transactions:", error)
    throw new Error(`Failed to get transactions for user ${userId}`)
  }
}

export async function recordUserTransaction(
  userId: string,
  transaction: Omit<Transaction, "id" | "userId" | "date">,
): Promise<Transaction> {
  try {
    const transactionRecord: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      userId,
      ...transaction,
      date: new Date().toISOString(),
    }

    const command = new PutCommand({
      TableName: TABLES.TRANSACTIONS,
      Item: transactionRecord,
    })

    await docClient.send(command)
    return transactionRecord
  } catch (error) {
    console.error("Error recording transaction:", error)
    throw new Error("Failed to record transaction")
  }
}

// Watchlist Operations
export async function getUserWatchlist(userId: string): Promise<StockData[]> {
  try {
    // Get watchlist symbols for user
    const watchlistCommand = new QueryCommand({
      TableName: TABLES.WATCHLISTS,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })

    const watchlistResponse = await docClient.send(watchlistCommand)
    const watchlistItems = (watchlistResponse.Items as WatchlistItem[]) || []

    if (watchlistItems.length === 0) {
      return []
    }

    // Get stock data for each symbol
    const stockPromises = watchlistItems.map((item) => getStockPrice(item.symbol))
    const stocks = await Promise.all(stockPromises)

    return stocks.filter((stock) => stock !== null) as StockData[]
  } catch (error) {
    console.error("Error getting user watchlist:", error)
    throw new Error(`Failed to get watchlist for user ${userId}`)
  }
}

export async function addToWatchlist(userId: string, symbol: string): Promise<void> {
  try {
    const watchlistItem: WatchlistItem = {
      userId,
      symbol,
      addedAt: new Date().toISOString(),
    }

    const command = new PutCommand({
      TableName: TABLES.WATCHLISTS,
      Item: watchlistItem,
      ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(symbol)",
    })

    await docClient.send(command)
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      // Item already exists, which is fine
      return
    }
    console.error("Error adding to watchlist:", error)
    throw new Error(`Failed to add ${symbol} to watchlist`)
  }
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.WATCHLISTS,
      Key: {
        userId,
        symbol,
      },
    })

    await docClient.send(command)
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    throw new Error(`Failed to remove ${symbol} from watchlist`)
  }
}

// Portfolio Operations
export async function getUserPortfolio(userId: string): Promise<any[]> {
  try {
    const transactions = await getUserTransactions(userId)

    // Calculate portfolio positions from transactions
    const positions: Record<string, any> = {}

    for (const transaction of transactions) {
      if (!positions[transaction.symbol]) {
        positions[transaction.symbol] = {
          symbol: transaction.symbol,
          shares: 0,
          totalCost: 0,
        }
      }

      const position = positions[transaction.symbol]

      if (transaction.type === "BUY") {
        position.shares += transaction.shares
        position.totalCost += transaction.total
      } else if (transaction.type === "SELL") {
        position.shares -= transaction.shares
        position.totalCost -= transaction.shares * position.avgPrice || 0
      }

      position.avgPrice = position.shares > 0 ? position.totalCost / position.shares : 0
    }

    // Filter out positions with 0 shares and enrich with current prices
    const activePositions = Object.values(positions).filter((pos: any) => pos.shares > 0)

    const enrichedPositions = await Promise.all(
      activePositions.map(async (position: any) => {
        const stockData = await getStockPrice(position.symbol)
        if (!stockData) return null

        const currentValue = stockData.price * position.shares
        const costBasis = position.totalCost
        const profit = currentValue - costBasis
        const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0

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

    return enrichedPositions.filter((pos) => pos !== null)
  } catch (error) {
    console.error("Error getting user portfolio:", error)
    throw new Error(`Failed to get portfolio for user ${userId}`)
  }
}

// Stock History Operations
export async function getStockHistory(symbol: string, timeframe: string): Promise<any[]> {
  try {
    // Calculate date range based on timeframe
    const endDate = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case "1D":
        startDate.setDate(endDate.getDate() - 1)
        break
      case "1W":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "1Y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case "5Y":
        startDate.setFullYear(endDate.getFullYear() - 5)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    const command = new QueryCommand({
      TableName: TABLES.STOCK_HISTORY,
      KeyConditionExpression: "symbol = :symbol AND #date BETWEEN :startDate AND :endDate",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":symbol": symbol,
        ":startDate": startDate.toISOString(),
        ":endDate": endDate.toISOString(),
      },
      ScanIndexForward: true, // Oldest first
    })

    const response = await docClient.send(command)
    return response.Items || []
  } catch (error) {
    console.error("Error getting stock history:", error)
    throw new Error(`Failed to get history for ${symbol}`)
  }
}

export async function saveStockHistoryPoint(symbol: string, data: any): Promise<void> {
  try {
    const command = new PutCommand({
      TableName: TABLES.STOCK_HISTORY,
      Item: {
        symbol,
        date: new Date().toISOString(),
        ...data,
      },
    })

    await docClient.send(command)
  } catch (error) {
    console.error("Error saving stock history:", error)
    throw new Error(`Failed to save history for ${symbol}`)
  }
}
