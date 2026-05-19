import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { formatMoney, formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PnlReport {
  timeframe: string
  revenue: number
  cogs: number
  ebayFees: number
  shippingCosts: number
  grossProfit: number
  operationalOverhead: number
  netBusinessIncome: number
}

interface Expense {
  id: number
  label: string
  amount: number
  date: string
  category: string | null
  notes: string | null
}

function StatCard({ label, value, sub, positive }: { label: string; value: number; sub?: string; positive?: boolean }) {
  const color = positive != null
    ? (positive ? "text-green-600 dark:text-green-400" : value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")
    : ""
  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <p className={`text-2xl font-semibold tabular-nums ${color}`}>{formatMoney(value)}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function AddExpenseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const reset = () => { setLabel(""); setAmount(""); setCategory(""); setDate(new Date().toISOString().split("T")[0]) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !amount) return
    try {
      await apiFetch("/api/expenses/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, amount: parseFloat(amount), date, category: category || null, notes: null }),
      })
      toast.success("Expense added")
      onSuccess()
      reset()
      setOpen(false)
    } catch {
      toast.error("Failed to add expense")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 mt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="exp-label">Description</Label>
            <Input id="exp-label" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Shipping supplies" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-amount">Amount ($)</Label>
            <Input id="exp-amount" type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-date">Date</Label>
            <Input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-category">Category <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="exp-category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Supplies, Software…" />
          </div>
          <Button type="submit" className="w-full">Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function LedgerPage() {
  const [timeframe, setTimeframe] = useState("YTD")
  const qc = useQueryClient()

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ["pnl", timeframe],
    queryFn: () => apiFetch<PnlReport>(`/api/analytics/pnl?timeframe=${timeframe}`),
  })

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => apiFetch<Expense[]>("/api/expenses/"),
  })

  const deleteExpense = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["pnl"] }) },
    onError: () => toast.error("Failed to delete expense"),
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="30D">30 days</TabsTrigger>
            <TabsTrigger value="90D">90 days</TabsTrigger>
            <TabsTrigger value="YTD">YTD</TabsTrigger>
            <TabsTrigger value="ALL">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {pnlLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : pnl ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Revenue" value={pnl.revenue} />
            <StatCard label="Gross Profit" value={pnl.grossProfit} positive />
            <StatCard label="Op. Overhead" value={pnl.operationalOverhead} />
            <StatCard label="Net Income" value={pnl.netBusinessIncome} positive />
          </div>

          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Breakdown</p>
            <div className="space-y-1.5">
              {[
                { label: "Revenue", value: pnl.revenue },
                { label: "COGS", value: -pnl.cogs },
                { label: "eBay fees", value: -pnl.ebayFees },
                { label: "Shipping costs", value: -pnl.shippingCosts },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`tabular-nums font-medium ${value < 0 ? "text-red-600 dark:text-red-400" : ""}`}>{formatMoney(value)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Gross profit</span>
                <span className={`tabular-nums ${pnl.grossProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatMoney(pnl.grossProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operational overhead</span>
                <span className="tabular-nums text-red-600 dark:text-red-400">{formatMoney(-pnl.operationalOverhead)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net business income</span>
                <span className={`tabular-nums ${pnl.netBusinessIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatMoney(pnl.netBusinessIncome)}</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Business expenses</h3>
          <AddExpenseDialog onSuccess={() => { qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["pnl"] }) }} />
        </div>

        {expLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !expenses?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No expenses recorded</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.label}</TableCell>
                    <TableCell>{exp.category ? <Badge variant="secondary" className="text-xs">{exp.category}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(exp.date)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(exp.amount)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteExpense.mutate(exp.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
