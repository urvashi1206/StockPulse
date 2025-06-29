"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock search results
const mockSearchResults = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
]

export default function AddStockPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      const results = mockSearchResults.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  const handleAddToWatchlist = (symbol: string) => {
    // In a real app, this would call an API to add the stock to the user's watchlist
    console.log(`Adding ${symbol} to watchlist`)

    // Navigate back to dashboard
    router.push("/")
  }

  return (
    <DashboardShell>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Add Stock</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Search Stocks</CardTitle>
          <CardDescription>Search for stocks by symbol or company name to add to your watchlist</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search">
            <TabsList className="mb-4">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="sectors">Sectors</TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by symbol or company name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {isSearching ? (
                <div className="text-center py-8">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
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
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">No results found</div>
              ) : null}
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockSearchResults.slice(0, 6).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted"
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <Button size="sm" onClick={() => handleAddToWatchlist(stock.symbol)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sectors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Technology</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockSearchResults.slice(0, 3).map((stock) => (
                      <div key={stock.symbol} className="flex justify-between items-center">
                        <span>{stock.symbol}</span>
                        <Button size="sm" variant="outline" onClick={() => handleAddToWatchlist(stock.symbol)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Finance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockSearchResults.slice(7, 10).map((stock) => (
                      <div key={stock.symbol} className="flex justify-between items-center">
                        <span>{stock.symbol}</span>
                        <Button size="sm" variant="outline" onClick={() => handleAddToWatchlist(stock.symbol)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button onClick={() => router.push("/")}>Done</Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}
