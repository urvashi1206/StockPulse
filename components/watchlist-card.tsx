"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, SearchIcon, XIcon } from "lucide-react"

// Mock watchlist data
const initialWatchlist = [
  { symbol: "AAPL", name: "Apple Inc.", price: 187.68, change: 1.23 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 403.78, change: -0.87 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.56, change: 2.34 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.12, change: 3.45 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -2.56 },
]

export function WatchlistCard() {
  const [watchlist, setWatchlist] = useState(initialWatchlist)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWatchlist = watchlist.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((stock) => stock.symbol !== symbol))
  }

  return (
    <Card className="h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Watchlist</CardTitle>
        <div className="relative mt-2">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[300px]">
        <div className="space-y-2">
          {filteredWatchlist.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">${stock.price.toFixed(2)}</div>
                  <div className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeFromWatchlist(stock.symbol)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2 bg-transparent">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
