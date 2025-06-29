/**
 * Real AWS Athena Service Implementation
 * This handles complex analytics queries using AWS Athena
 */

import { StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from "@aws-sdk/client-athena"
import { athenaClient, ATHENA_CONFIG } from "./config"

// Execute Athena Query
export async function executeAthenaQuery(query: string): Promise<any> {
  try {
    // Start query execution
    const startCommand = new StartQueryExecutionCommand({
      QueryString: query,
      QueryExecutionContext: {
        Database: ATHENA_CONFIG.DATABASE,
      },
      ResultConfiguration: {
        OutputLocation: ATHENA_CONFIG.OUTPUT_LOCATION,
      },
      WorkGroup: ATHENA_CONFIG.WORKGROUP,
    })

    const startResponse = await athenaClient.send(startCommand)
    const queryExecutionId = startResponse.QueryExecutionId!

    // Wait for query to complete
    let queryStatus = "RUNNING"
    while (queryStatus === "RUNNING" || queryStatus === "QUEUED") {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const statusCommand = new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      })

      const statusResponse = await athenaClient.send(statusCommand)
      queryStatus = statusResponse.QueryExecution?.Status?.State || "FAILED"

      if (queryStatus === "FAILED" || queryStatus === "CANCELLED") {
        throw new Error(`Query failed: ${statusResponse.QueryExecution?.Status?.StateChangeReason}`)
      }
    }

    // Get query results
    const resultsCommand = new GetQueryResultsCommand({
      QueryExecutionId: queryExecutionId,
    })

    const resultsResponse = await athenaClient.send(resultsCommand)
    return resultsResponse.ResultSet
  } catch (error) {
    console.error("Error executing Athena query:", error)
    throw new Error(`Failed to execute query: ${error.message}`)
  }
}

// Query historical data with analytics
export async function queryHistoricalDataWithAnalytics(
  symbol: string,
  timeframe: string,
  metrics: string[] = [],
): Promise<any[]> {
  try {
    let selectClause = "date, price, volume"

    if (metrics.includes("moving_avg")) {
      selectClause += ", AVG(price) OVER (ORDER BY date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) as moving_avg_20"
    }

    if (metrics.includes("volatility")) {
      selectClause += ", STDDEV(price) OVER (ORDER BY date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) as volatility"
    }

    const query = `
      SELECT ${selectClause}
      FROM stock_history
      WHERE symbol = '${symbol}'
        AND date >= date_add('day', -${getTimeframeDays(timeframe)}, current_date)
      ORDER BY date
    `

    const results = await executeAthenaQuery(query)

    if (!results?.Rows) {
      return []
    }

    // Transform results to usable format
    const headers = results.Rows[0]?.Data?.map((col: any) => col.VarCharValue) || []
    const dataRows = results.Rows.slice(1) || []

    return dataRows.map((row: any) => {
      const rowData: any = {}
      row.Data.forEach((cell: any, index: number) => {
        const header = headers[index]
        const value = cell.VarCharValue

        if (header === "date") {
          rowData[header] = value
        } else if (
          header === "price" ||
          header === "volume" ||
          header.includes("moving_avg") ||
          header === "volatility"
        ) {
          rowData[header] = Number.parseFloat(value) || 0
        } else {
          rowData[header] = value
        }
      })
      return rowData
    })
  } catch (error) {
    console.error("Error querying historical data with analytics:", error)
    throw new Error(`Failed to query analytics data for ${symbol}`)
  }
}

// Analyze stock performance
export async function analyzeStockPerformance(symbol: string, startDate: string, endDate: string): Promise<any> {
  try {
    const query = `
      WITH daily_returns AS (
        SELECT 
          date,
          price,
          LAG(price) OVER (ORDER BY date) as prev_price,
          (price - LAG(price) OVER (ORDER BY date)) / LAG(price) OVER (ORDER BY date) as daily_return
        FROM stock_history
        WHERE symbol = '${symbol}' 
          AND date BETWEEN date('${startDate}') AND date('${endDate}')
      )
      SELECT
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        STDDEV(daily_return) * SQRT(252) as annualized_volatility,
        AVG(daily_return) * 252 as annualized_return,
        COUNT(*) as trading_days
      FROM daily_returns
      WHERE daily_return IS NOT NULL
    `

    const results = await executeAthenaQuery(query)

    if (!results?.Rows || results.Rows.length < 2) {
      throw new Error("No data found for analysis")
    }

    const dataRow = results.Rows[1]?.Data || []

    return {
      minPrice: Number.parseFloat(dataRow[0]?.VarCharValue) || 0,
      maxPrice: Number.parseFloat(dataRow[1]?.VarCharValue) || 0,
      avgPrice: Number.parseFloat(dataRow[2]?.VarCharValue) || 0,
      annualizedVolatility: Number.parseFloat(dataRow[3]?.VarCharValue) || 0,
      annualizedReturn: Number.parseFloat(dataRow[4]?.VarCharValue) || 0,
      tradingDays: Number.parseInt(dataRow[5]?.VarCharValue) || 0,
    }
  } catch (error) {
    console.error("Error analyzing stock performance:", error)
    throw new Error(`Failed to analyze performance for ${symbol}`)
  }
}

// Get sector analysis
export async function getSectorAnalysis(): Promise<any[]> {
  try {
    const query = `
      SELECT 
        sector,
        COUNT(*) as stock_count,
        AVG(price) as avg_price,
        SUM(volume) as total_volume,
        AVG(change_percent) as avg_change_percent
      FROM stocks s
      JOIN stock_sectors ss ON s.symbol = ss.symbol
      GROUP BY sector
      ORDER BY total_volume DESC
    `

    const results = await executeAthenaQuery(query)

    if (!results?.Rows) {
      return []
    }

    const headers = results.Rows[0]?.Data?.map((col: any) => col.VarCharValue) || []
    const dataRows = results.Rows.slice(1) || []

    return dataRows.map((row: any) => {
      const rowData: any = {}
      row.Data.forEach((cell: any, index: number) => {
        const header = headers[index]
        const value = cell.VarCharValue

        if (header === "sector") {
          rowData[header] = value
        } else {
          rowData[header] = Number.parseFloat(value) || 0
        }
      })
      return rowData
    })
  } catch (error) {
    console.error("Error getting sector analysis:", error)
    throw new Error("Failed to get sector analysis")
  }
}

// Helper function to convert timeframe to days
function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case "1D":
      return 1
    case "1W":
      return 7
    case "1M":
      return 30
    case "3M":
      return 90
    case "1Y":
      return 365
    case "5Y":
      return 1825
    default:
      return 30
  }
}

// Setup Athena database and tables
export async function setupAthenaDatabase(): Promise<void> {
  try {
    // Create database
    const createDbQuery = `CREATE DATABASE IF NOT EXISTS ${ATHENA_CONFIG.DATABASE}`
    await executeAthenaQuery(createDbQuery)

    // Create stock_history table
    const createTableQuery = `
      CREATE EXTERNAL TABLE IF NOT EXISTS ${ATHENA_CONFIG.DATABASE}.stock_history (
        symbol string,
        date timestamp,
        price double,
        volume bigint,
        open_price double,
        high_price double,
        low_price double,
        close_price double
      )
      PARTITIONED BY (
        year string,
        month string,
        day string
      )
      STORED AS PARQUET
      LOCATION 's3://stocktracker-historical-data/partitioned/'
      TBLPROPERTIES ('parquet.compression'='SNAPPY')
    `
    await executeAthenaQuery(createTableQuery)

    console.log("Athena database and tables created successfully")
  } catch (error) {
    console.error("Error setting up Athena database:", error)
    throw new Error("Failed to setup Athena database")
  }
}
