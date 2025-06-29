import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { StockOverview } from "@/components/stock-overview"
import { WatchlistCard } from "@/components/watchlist-card"
import { RecentActivity } from "@/components/recent-activity"
import { StockChart } from "@/components/stock-chart"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/stocks/add">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Stock
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StockOverview symbol="AAPL" name="Apple Inc." price={187.68} change={1.23} changePercent={0.66} />
        <StockOverview symbol="MSFT" name="Microsoft Corp." price={403.78} change={-0.87} changePercent={-0.22} />
        <StockOverview symbol="GOOGL" name="Alphabet Inc." price={142.56} change={2.34} changePercent={1.67} />
        <StockOverview symbol="AMZN" name="Amazon.com Inc." price={178.12} change={3.45} changePercent={1.98} />
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-7 md:col-span-5">
          <StockChart />
        </div>
        <div className="col-span-7 md:col-span-2">
          <WatchlistCard />
        </div>
      </div>
      <div className="mt-4">
        <RecentActivity />
      </div>
    </DashboardShell>
  )
}
