/**
 * External Stock API Integration
 * This integrates with real stock market data providers like Alpha Vantage, IEX Cloud, etc.
 */

// Types
interface ExternalStockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  dividend?: number
}

interface ExternalHistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const IEX_CLOUD_API_KEY = process.env.IEX_CLOUD_API_KEY
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

// Alpha Vantage API Integration
export async function fetchStockDataFromAlphaVantage(symbol: string): Promise<ExternalStockData> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const quote = data["Global Quote"]

    if (!quote) {
      throw new Error("No data found for symbol")
    }

    return {
      symbol: quote["01. symbol"],
      name: symbol, // Alpha Vantage doesn't provide company name in this endpoint
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
      volume: Number.parseInt(quote["06. volume"]),
    }
  } catch (error) {
    console.error("Error fetching from Alpha Vantage:", error)
    throw new Error(`Failed to fetch stock data for ${symbol}`)
  }
}

// IEX Cloud API Integration
export async function fetchStockDataFromIEX(symbol: string): Promise<ExternalStockData> {
  if (!IEX_CLOUD_API_KEY) {
    throw new Error("IEX Cloud API key not configured")
  }

  try {
    const response = await fetch(`https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${IEX_CLOUD_API_KEY}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      symbol: data.symbol,
      name: data.companyName,
      price: data.latestPrice,
      change: data.change,
      changePercent: data.changePercent * 100,
      volume: data.latestVolume,
      marketCap: data.marketCap,
      pe: data.peRatio,
    }
  } catch (error) {
    console.error("Error fetching from IEX Cloud:", error)
    throw new Error(`Failed to fetch stock data for ${symbol}`)
  }
}

// Finnhub API Integration
export async function fetchStockDataFromFinnhub(symbol: string): Promise<ExternalStockData> {
  if (!FINNHUB_API_KEY) {
    throw new Error("Finnhub API key not configured")
  }

  try {
    // Get quote data
    const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`)

    if (!quoteResponse.ok) {
      throw new Error(`HTTP error! status: ${quoteResponse.status}`)
    }

    const quoteData = await quoteResponse.json()

    // Get company profile
    const profileResponse = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
    )

    const profileData = profileResponse.ok ? await profileResponse.json() : {}

    return {
      symbol: symbol,
      name: profileData.name || symbol,
      price: quoteData.c, // current price
      change: quoteData.d, // change
      changePercent: quoteData.dp, // change percent
      volume: 0, // Finnhub doesn't provide volume in quote endpoint
      marketCap: profileData.marketCapitalization,
    }
  } catch (error) {
    console.error("Error fetching from Finnhub:", error)
    throw new Error(`Failed to fetch stock data for ${symbol}`)
  }
}

// Fetch historical data from Alpha Vantage
export async function fetchHistoricalDataFromAlphaVantage(
  symbol: string,
  timeframe: "daily" | "weekly" | "monthly" = "daily",
): Promise<ExternalHistoricalData[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  try {
    const functionName =
      timeframe === "daily"
        ? "TIME_SERIES_DAILY"
        : timeframe === "weekly"
          ? "TIME_SERIES_WEEKLY"
          : "TIME_SERIES_MONTHLY"

    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const timeSeriesKey = Object.keys(data).find((key) => key.includes("Time Series"))

    if (!timeSeriesKey || !data[timeSeriesKey]) {
      throw new Error("No historical data found")
    }

    const timeSeries = data[timeSeriesKey]

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"]),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error fetching historical data from Alpha Vantage:", error)
    throw new Error(`Failed to fetch historical data for ${symbol}`)
  }
}

// Main function to fetch stock data (tries multiple sources)
export async function fetchStockData(symbol: string): Promise<ExternalStockData> {
  const errors: string[] = []

  // Try IEX Cloud first (most reliable)
  if (IEX_CLOUD_API_KEY) {
    try {
      return await fetchStockDataFromIEX(symbol)
    } catch (error) {
      errors.push(`IEX Cloud: ${error.message}`)
    }
  }

  // Try Alpha Vantage as fallback
  if (ALPHA_VANTAGE_API_KEY) {
    try {
      return await fetchStockDataFromAlphaVantage(symbol)
    } catch (error) {
      errors.push(`Alpha Vantage: ${error.message}`)
    }
  }

  // Try Finnhub as last resort
  if (FINNHUB_API_KEY) {
    try {
      return await fetchStockDataFromFinnhub(symbol)
    } catch (error) {
      errors.push(`Finnhub: ${error.message}`)
    }
  }

  throw new Error(`Failed to fetch stock data from all sources: ${errors.join(", ")}`)
}

// Search for stocks
export async function searchStocks(query: string): Promise<any[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.bestMatches) {
      return []
    }

    return data.bestMatches.map((match: any) => ({
      symbol: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
      marketOpen: match["5. marketOpen"],
      marketClose: match["6. marketClose"],
      timezone: match["7. timezone"],
      currency: match["8. currency"],
      matchScore: Number.parseFloat(match["9. matchScore"]),
    }))
  } catch (error) {
    console.error("Error searching stocks:", error)
    throw new Error(`Failed to search stocks for query: ${query}`)
  }
}
