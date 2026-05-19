import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { ResearchItem } from "@/lib/types"

const schema = z.object({
  amount: z.coerce.number().positive("Must be a positive amount"),
  proxy_amount: z.coerce.number().positive().optional().or(z.literal("")),
})
type FormValues = z.infer<typeof schema>

export function BidForm({ item, onSuccess }: { item: ResearchItem; onSuccess?: () => void }) {
  const qc = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: item.valuation?.max_bid_for_target_roi ?? undefined, proxy_amount: "" },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await apiFetch(`/api/research/${item.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: values.amount, proxy_amount: values.proxy_amount || undefined }),
      })
      toast.success("Bid placed")
      qc.invalidateQueries({ queryKey: ["research"] })
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bid failed")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bid amount ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proxy_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proxy max ($) <span className="text-muted-foreground font-normal">optional</span></FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="Auto-bid up to…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {item.valuation?.max_bid_for_target_roi && (
          <p className="text-xs text-muted-foreground">
            Suggested max bid for {item.valuation.target_roi_pct}% ROI: <strong>${item.valuation.max_bid_for_target_roi.toFixed(0)}</strong>
          </p>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Placing bid…" : "Place bid"}
        </Button>
      </form>
    </Form>
  )
}
