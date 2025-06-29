"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import { fetchHistoricalDataWithAnalytics, fetchStockPerformance } from "@/app/actions/stock-actions"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [timeframe, setTimeframe] = useState("1Y")
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const stocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedStock, timeframe])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Load historical data with analytics
      const analyticsResult = await fetchHistoricalDataWithAnalytics(selectedStock, timeframe, [
        "moving_avg",
        "volatility",
      ])

      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data)
      }

      // Load performance data
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      const performanceResult = await fetchStockPerformance(selectedStock, startDate, endDate)

      if (performanceResult.success) {
        setPerformanceData(performanceResult.data)
      }
    } catch (error) {
      console.error("Error loading analytics data:", error)
      // Generate mock data for fallback
      setAnalyticsData(generateMockAnalyticsData())
      setPerformanceData(generateMockPerformanceData())
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalyticsData = () => {
    const data = []
    let price = 150
    const days = timeframe === "1Y" ? 365 : timeframe === "3M" ? 90 : 30

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))

      price += (Math.random() - 0.5) * 10
      const movingAvg = price + (Math.random() - 0.5) * 5
      const volatility = Math.random() * 0.05

      data.push({
        date: date.toLocaleDateString(),
        price: Number.parseFloat(price.toFixed(2)),
        movingAvg20: Number.parseFloat(movingAvg.toFixed(2)),
        volatility: Number.parseFloat(volatility.toFixed(4)),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      })
    }

    return data
  }

  const generateMockPerformanceData = () => ({
    minPrice: 120 + Math.random() * 30,
    maxPrice: 180 + Math.random() * 30,
    avgPrice: 150 + Math.random() * 20,
    annualizedVolatility: 0.15 + Math.random() * 0.1,
    annualizedReturn: 0.08 + Math.random() * 0.1,
  })

  const sectorData = [
    { name: "Technology", value: 35, color: "#0088FE" },
    { name: "Healthcare", value: 20, color: "#00C49F" },
    { name: "Finance", value: 15, color: "#FFBB28" },
    { name: "Consumer", value: 20, color: "#FF8042" },
    { name: "Energy", value: 10, color: "#8884D8" },
  ]

  const volumeData = analyticsData.slice(-30).map((item) => ({
    date: item.date,
    volume: item.volume / 1000000, // Convert to millions
  }))

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Advanced stock analysis and market insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map((stock) => (
                <SelectItem key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="5Y">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Min Price</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${performanceData.minPrice?.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${performanceData.maxPrice?.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${performanceData.avgPrice?.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volatility</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(performanceData.annualizedVolatility * 100)?.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={performanceData.annualizedReturn >= 0 ? "default" : "destructive"}>
                  {(performanceData.annualizedReturn * 100)?.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="price-analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="price-analysis">Price Analysis</TabsTrigger>
          <TabsTrigger value="volume-analysis">Volume Analysis</TabsTrigger>
          <TabsTrigger value="sector-analysis">Sector Analysis</TabsTrigger>
          <TabsTrigger value="technical-indicators">Technical Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="price-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Movement with Moving Average</CardTitle>
              <CardDescription>
                {selectedStock} price movement over {timeframe} with 20-day moving average
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={2} name="Price" />
                    <Line
                      type="monotone"
                      dataKey="movingAvg20"
                      stroke="#DC2626"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="20-day MA"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume Analysis</CardTitle>
              <CardDescription>Daily trading volume over the last 30 days (in millions)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}M`, "Volume"]} />
                  <Bar dataKey="volume" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sector-analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Market sector distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <CardDescription>Year-to-date sector returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorData.map((sector, index) => (
                    <div key={sector.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{sector.name}</span>
                      </div>
                      <Badge variant={Math.random() > 0.5 ? "default" : "destructive"}>
                        {Math.random() > 0.5 ? "+" : "-"}
                        {(Math.random() * 20).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical-indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volatility Analysis</CardTitle>
              <CardDescription>Price volatility over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(2)}%`, "Volatility"]} />
                    <Line type="monotone" dataKey="volatility" stroke="#DC2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
