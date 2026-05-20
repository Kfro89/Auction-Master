import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { ResearchItem } from "@/lib/types"

export function useWatchlist(limit = 50) {
  return useInfiniteQuery({
    queryKey: ["watchlist", { limit }],
    queryFn: ({ pageParam = 0 }) => 
      apiFetch<ResearchItem[]>(`/api/research/watchlist?limit=${limit}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined
      return allPages.length * limit
    },
  })
}

export function useUnwatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/toggle-watch`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["watchlist"] })
      const prev = qc.getQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["watchlist"] })
      qc.setQueriesData<InfiniteData<ResearchItem[]>>({ queryKey: ["watchlist"] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => page.filter(i => i.id !== id))
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] })
      qc.invalidateQueries({ queryKey: ["research"] })
    },
  })
}
