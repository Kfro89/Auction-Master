import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { ResearchItem } from "@/lib/types"

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => apiFetch<ResearchItem[]>("/api/research/watchlist"),
  })
}

export function useUnwatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/toggle-watch`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["watchlist"] })
      const prev = qc.getQueryData<ResearchItem[]>(["watchlist"])
      qc.setQueryData<ResearchItem[]>(["watchlist"], (old) => old?.filter((i) => i.id !== id))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["watchlist"], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] })
      qc.invalidateQueries({ queryKey: ["research"] })
    },
  })
}
