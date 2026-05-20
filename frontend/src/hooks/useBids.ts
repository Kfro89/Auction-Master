import { useQuery, useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { BidItem, Comparable } from "@/lib/types"

export function useBids(showHidden = false, limit = 50) {
  return useInfiniteQuery({
    queryKey: ["bidding", { showHidden, limit }],
    queryFn: ({ pageParam = 0 }) => 
      apiFetch<BidItem[]>(`/api/bidding/?show_hidden=${showHidden}&limit=${limit}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined
      return allPages.length * limit
    },
    refetchInterval: 30_000,
  })
}

export function useHideBid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/api/bidding/${id}/hide`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["bidding"] })
      const prev = qc.getQueriesData<InfiniteData<BidItem[]>>({ queryKey: ["bidding"] })
      qc.setQueriesData<InfiniteData<BidItem[]>>({ queryKey: ["bidding"] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => 
            page.map(item => item.id === id ? { ...item, is_hidden_from_active: true } : item)
          )
        }
      })
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

export function useEnrichBid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<BidItem>(`/api/bidding/${id}/enrich`, { method: "POST" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["bidding"] })
      qc.invalidateQueries({ queryKey: ["research"] })
    },
  })
}

export function useUpdateBidQueries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, queries }: { id: number; queries: string[] }) => 
      apiFetch<BidItem>(`/api/bidding/${id}/queries`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries })
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["bidding"] })
      qc.invalidateQueries({ queryKey: ["research"] })
    },
  })
}

export function useBulkHideBids() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: { ids: number[]; is_hidden: boolean }) => 
      apiFetch("/api/bidding/bulk-hide", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["bidding"] }),
  })
}
