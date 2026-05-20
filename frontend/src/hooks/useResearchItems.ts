import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { ResearchItem } from "@/lib/types"

export function useResearchItems(showArchived = false, limit = 50) {
  return useInfiniteQuery({
    queryKey: ["research", { showArchived, limit }],
    queryFn: ({ pageParam = 0 }) => 
      apiFetch<ResearchItem[]>(`/api/research/?show_archived=${showArchived}&limit=${limit}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined
      return allPages.length * limit
    },
  })
}

export function useScanItems() {
  return useMutation({
    mutationFn: () => apiFetch<{ status: string }>("/api/admin/scrape/all", { method: "POST" }),
  })
}

export function useReevaluateItems() {
  return useMutation({
    mutationFn: () => apiFetch<{ status: string }>("/api/admin/valuate-bulk", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "all", target_roi: 0.30 })
    }),
  })
}

export function useToggleWatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/toggle-watch`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["research"] })
      const prev = qc.getQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["research"] })
      qc.setQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["research"] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => 
            page.map(item => item.id === id ? { ...item, is_watched: !item.is_watched } : item)
          )
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["research"] }),
  })
}

export function useToggleArchive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/toggle-archive`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["research"] })
      const prev = qc.getQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["research"] })
      qc.setQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["research"] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => 
            page.map(item => item.id === id ? { ...item, is_archived: !item.is_archived } : item)
          )
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["research"] }),
  })
}

export function useEnrichItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/enrich`, { method: "POST" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["research"] })
      qc.invalidateQueries({ queryKey: ["bidding"] })
    },
  })
}

export function useUpdateQueries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, queries }: { id: number; queries: string[] }) => 
      apiFetch<ResearchItem>(`/api/research/${id}/queries`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries })
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["research"] })
      qc.invalidateQueries({ queryKey: ["bidding"] })
    },
  })
}

export function useBulkWatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: { ids: number[]; is_watched: boolean }) => 
      apiFetch("/api/research/bulk-watch", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["research"] }),
  })
}

export function useBulkArchive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: { ids: number[]; is_archived: boolean }) => 
      apiFetch("/api/research/bulk-archive", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["research"] }),
  })
}
