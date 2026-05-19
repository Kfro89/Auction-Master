import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { BidItem, Comparable } from "@/lib/types"

export function useBids(showHidden = false) {
  return useQuery({
    queryKey: ["bidding", { showHidden }],
    queryFn: () => apiFetch<BidItem[]>(`/api/bidding/?show_hidden=${showHidden}`),
    refetchInterval: 30_000,
  })
}

export function useHideBid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/api/bidding/${id}/hide`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["bidding"] })
      const prev = qc.getQueriesData<BidItem[]>({ queryKey: ["bidding"] })
      qc.setQueriesData<BidItem[]>({ queryKey: ["bidding"] }, (old) =>
        old?.map((item) => item.id === id ? { ...item, is_hidden_from_active: true } : item)
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["bidding"] }),
  })
}

export function useClaimBid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/api/bidding/${id}/claim`, { method: "POST" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["bidding"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

export function useComparables(itemId: number | null) {
  return useQuery({
    queryKey: ["comparables", itemId],
    queryFn: () => apiFetch<Comparable[]>(`/api/bidding/${itemId}/comparables`),
    enabled: itemId !== null,
  })
}
