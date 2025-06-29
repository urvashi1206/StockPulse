import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

interface StockOverviewProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export function StockOverview({ symbol, name, price, change, changePercent }: StockOverviewProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{name}</p>
            <h3 className="text-2xl font-bold">{symbol}</h3>
          </div>
          <div className={`flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-semibold">${price.toFixed(2)}</p>
          <div className={`flex items-center text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
            <span>
              {isPositive ? "+" : ""}
              {change.toFixed(2)}
            </span>
            <span className="ml-1">
              ({isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
