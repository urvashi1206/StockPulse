"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"
import { fetchUserPortfolio } from "@/app/actions/user-actions"
import { recordTransaction } from "@/app/actions/user-actions"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    type: "BUY",
    symbol: "",
    shares: "",
    price: "",
  })

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user-1"

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    setLoading(true)
    try {
      const result = await fetchUserPortfolio(userId)
      if (result.success && Array.isArray(result.data)) {
        setPortfolio(result.data)
      }
    } catch (error) {
      console.error("Error loading portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async () => {
    try {
      const transaction = {
        type: transactionForm.type,
        symbol: transactionForm.symbol.toUpperCase(),
        shares: Number.parseInt(transactionForm.shares),
        price: Number.parseFloat(transactionForm.price),
        total: Number.parseInt(transactionForm.shares) * Number.parseFloat(transactionForm.price),
      }

      const result = await recordTransaction(userId, transaction)
      if (result.success) {
        await loadPortfolio()
        setIsDialogOpen(false)
        setTransactionForm({ type: "BUY", symbol: "", shares: "", price: "" })
      }
    } catch (error) {
      console.error("Error recording transaction:", error)
    }
  }

  const totalValue = portfolio.reduce((sum, position) => sum + (position.currentValue || 0), 0)
  const totalCost = portfolio.reduce((sum, position) => sum + (position.costBasis || 0), 0)
  const totalProfit = totalValue - totalCost
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and portfolio performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
              <DialogDescription>Add a new buy or sell transaction to your portfolio</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  Symbol
                </Label>
                <Input
                  id="symbol"
                  placeholder="AAPL"
                  className="col-span-3"
                  value={transactionForm.symbol}
                  onChange={(e) => setTransactionForm({ ...transactionForm, symbol: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shares" className="text-right">
                  Shares
                </Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="10"
                  className="col-span-3"
                  value={transactionForm.shares}
                  onChange={(e) => setTransactionForm({ ...transactionForm, shares: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  className="col-span-3"
                  value={transactionForm.price}
                  onChange={(e) => setTransactionForm({ ...transactionForm, price: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleTransaction}>Record Transaction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            {totalProfitPercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={totalProfitPercent >= 0 ? "default" : "destructive"}>
                {totalProfitPercent >= 0 ? "+" : ""}
                {totalProfitPercent.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current stock positions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading portfolio...</div>
          ) : portfolio.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No holdings in your portfolio yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>Cost Basis</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Return %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((position) => (
                  <TableRow key={position.symbol}>
                    <TableCell className="font-medium">{position.symbol}</TableCell>
                    <TableCell>{position.shares}</TableCell>
                    <TableCell>${position.avgPrice?.toFixed(2)}</TableCell>
                    <TableCell>${position.currentPrice?.toFixed(2)}</TableCell>
                    <TableCell>${position.currentValue?.toFixed(2)}</TableCell>
                    <TableCell>${position.costBasis?.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`${position.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {position.profit >= 0 ? "+" : ""}${position.profit?.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={position.profitPercent >= 0 ? "default" : "destructive"}>
                        {position.profitPercent >= 0 ? "+" : ""}
                        {position.profitPercent?.toFixed(2)}%
                      </Badge>
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
