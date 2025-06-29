/**
 * This service simulates AWS Lambda functions
 * In a real implementation, these would be separate Lambda functions deployed to AWS
 */

import {
  getStockPrice,
  getStockHistory,
  getUserWatchlist,
  updateUserWatchlist,
  getUserTransactions,
  recordUserTransaction,
  getUserPortfolio,
  updateUserPortfolio,
} from "./dynamodb-service"

// Lambda function to get real-time stock data
export async function getStockDataLambda(event: any) {
  try {
    const { symbol } = event.queryStringParameters || {}

    if (!symbol) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Symbol parameter is required" }),
      }
    }

    const stockData = await getStockPrice(symbol)

    return {
      statusCode: 200,
      body: JSON.stringify(stockData),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to get historical stock data
export async function getHistoricalDataLambda(event: any) {
  try {
    const { symbol, timeframe } = JSON.parse(event.body || "{}")

    if (!symbol || !timeframe) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Symbol and timeframe are required" }),
      }
    }

    const historicalData = await getStockHistory(symbol, timeframe)

    return {
      statusCode: 200,
      body: JSON.stringify(historicalData),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to get user's watchlist
export async function getWatchlistLambda(event: any) {
  try {
    const { userId } = event.queryStringParameters || {}

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID is required" }),
      }
    }

    const watchlist = await getUserWatchlist(userId)

    return {
      statusCode: 200,
      body: JSON.stringify(watchlist),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to update user's watchlist
export async function updateWatchlistLambda(event: any) {
  try {
    const { userId, symbols } = JSON.parse(event.body || "{}")

    if (!userId || !symbols) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID and symbols are required" }),
      }
    }

    const result = await updateUserWatchlist(userId, symbols)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to get user's transactions
export async function getTransactionsLambda(event: any) {
  try {
    const { userId } = event.queryStringParameters || {}

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID is required" }),
      }
    }

    const transactions = await getUserTransactions(userId)

    return {
      statusCode: 200,
      body: JSON.stringify(transactions),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to record a transaction
export async function recordTransactionLambda(event: any) {
  try {
    const { userId, transaction } = JSON.parse(event.body || "{}")

    if (!userId || !transaction) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID and transaction details are required" }),
      }
    }

    const result = await recordUserTransaction(userId, transaction)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to get user's portfolio
export async function getPortfolioLambda(event: any) {
  try {
    const { userId } = event.queryStringParameters || {}

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID is required" }),
      }
    }

    const portfolio = await getUserPortfolio(userId)

    return {
      statusCode: 200,
      body: JSON.stringify(portfolio),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}

// Lambda function to update user's portfolio
export async function updatePortfolioLambda(event: any) {
  try {
    const { userId, portfolio } = JSON.parse(event.body || "{}")

    if (!userId || !portfolio) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User ID and portfolio details are required" }),
      }
    }

    const result = await updateUserPortfolio(userId, portfolio)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error("Lambda error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}
