"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { fetchHistoricalData } from "@/app/actions/stock-actions"

interface StockChartProps {
  symbol?: string
  initialTimeframe?: string
}

export function StockChart({ symbol = "AAPL", initialTimeframe = "1M" }: StockChartProps) {
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistoricalData() {
      setLoading(true)
      try {
        const result = await fetchHistoricalData(symbol, timeframe)
        if (result.success && result.data) {
          setChartData(result.data)
        } else {
          console.error("Failed to load historical data:", result.error)
          // Fallback to mock data if API fails
          setChartData(generateMockData(getTimeframeDays(timeframe), 150))
        }
      } catch (error) {
        console.error("Error loading historical data:", error)
        // Fallback to mock data if API fails
        setChartData(generateMockData(getTimeframeDays(timeframe), 150))
      } finally {
        setLoading(false)
      }
    }

    loadHistoricalData()
  }, [symbol, timeframe])

  // Helper function to get days based on timeframe
  const getTimeframeDays = (tf: string) => {
    switch (tf) {
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
        return 365 * 5
      default:
        return 30
    }
  }

  // Mock data generator for fallback
  const generateMockData = (days: number, startPrice: number) => {
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
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: Number.parseFloat(currentPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      })
    }

    return data
  }

  return (
    <Card className="h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{symbol} Stock Price</CardTitle>
        <Tabs defaultValue={timeframe} value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
            <TabsTrigger value="5Y">5Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-[320px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#6B7280" }}
                axisLine={{ stroke: "#6B7280" }}
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#6B7280" }}
                axisLine={{ stroke: "#6B7280" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, "Price"]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  border: "1px solid #4B5563",
                  borderRadius: "6px",
                  color: "#E5E7EB",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
