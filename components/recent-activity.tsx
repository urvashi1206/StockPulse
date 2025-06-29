import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock activity data
const activities = [
  {
    id: 1,
    type: "BUY",
    symbol: "AAPL",
    shares: 10,
    price: 187.68,
    total: 1876.8,
    date: "2025-06-26T14:30:00Z",
  },
  {
    id: 2,
    type: "SELL",
    symbol: "MSFT",
    shares: 5,
    price: 403.78,
    total: 2018.9,
    date: "2025-06-25T10:15:00Z",
  },
  {
    id: 3,
    type: "BUY",
    symbol: "GOOGL",
    shares: 8,
    price: 142.56,
    total: 1140.48,
    date: "2025-06-24T16:45:00Z",
  },
  {
    id: 4,
    type: "BUY",
    symbol: "TSLA",
    shares: 3,
    price: 248.42,
    total: 745.26,
    date: "2025-06-23T09:20:00Z",
  },
  {
    id: 5,
    type: "SELL",
    symbol: "AMZN",
    shares: 4,
    price: 178.12,
    total: 712.48,
    date: "2025-06-22T13:10:00Z",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge variant={activity.type === "BUY" ? "default" : "destructive"}>{activity.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{activity.symbol}</TableCell>
                <TableCell>{activity.shares}</TableCell>
                <TableCell>${activity.price.toFixed(2)}</TableCell>
                <TableCell>${activity.total.toFixed(2)}</TableCell>
                <TableCell>{new Date(activity.date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
