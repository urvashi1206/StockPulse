"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, SearchIcon, XIcon, TrendingUp, TrendingDown, Star } from "lucide-react"
import { fetchUserWatchlist, removeFromWatchlist, addToWatchlist } from "@/app/actions/user-actions"
import { searchStocks } from "@/app/actions/stock-actions"

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user-1"

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    setLoading(true)
    try {
      const result = await fetchUserWatchlist(userId)
      if (result.success && Array.isArray(result.data)) {
        setWatchlist(result.data)
      }
    } catch (error) {
      console.error("Error loading watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const result = await searchStocks(searchQuery)
      if (result.success) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      const result = await addToWatchlist(userId, symbol)
      if (result.success) {
        await loadWatchlist()
        setSearchResults([])
        setSearchQuery("")
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    }
  }

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      const result = await removeFromWatchlist(userId, symbol)
      if (result.success) {
        await loadWatchlist()
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  const filteredWatchlist = watchlist.filter(
    (stock) =>
      stock.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">Track your favorite stocks and monitor their performance</p>
        </div>
        <Badge variant="secondary">{watchlist.length} stocks</Badge>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Stocks to Watchlist</CardTitle>
          <CardDescription>Search for stocks by symbol or company name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol or company name"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              <SearchIcon className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results</h4>
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted"
                >
                  <div>
                    <div className="font-medium">{result.symbol}</div>
                    <div className="text-sm text-muted-foreground">{result.name}</div>
                    <div className="text-xs text-muted-foreground">{result.exchange}</div>
                  </div>
                  <Button size="sm" onClick={() => handleAddToWatchlist(result.symbol)}>
                    <Star className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watchlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>Monitor your tracked stocks in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading watchlist...</div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No stocks in your watchlist yet</p>
              <Button onClick={() => setSearchQuery("")}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Stock
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Change %</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWatchlist.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>${stock.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change?.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stock.changePercent >= 0 ? "default" : "destructive"}>
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent?.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{stock.volume?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromWatchlist(stock.symbol)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
