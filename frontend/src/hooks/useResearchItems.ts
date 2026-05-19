import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { ResearchItem } from "@/lib/types"

export function useResearchItems(showArchived = false) {
  return useQuery({
    queryKey: ["research", { showArchived }],
    queryFn: () => apiFetch<ResearchItem[]>(`/api/research/?show_archived=${showArchived}`),
  })
}

export function useToggleWatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ResearchItem>(`/api/research/${id}/toggle-watch`, { method: "POST" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["research"] })
      const prev = qc.getQueriesData<ResearchItem[]>({ queryKey: ["research"] })
      qc.setQueriesData<ResearchItem[]>({ queryKey: ["research"] }, (old) =>
        old?.map((item) => item.id === id ? { ...item, is_watched: !item.is_watched } : item)
      )
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
      const prev = qc.getQueriesData<ResearchItem[]>({ queryKey: ["research"] })
      qc.setQueriesData<ResearchItem[]>({ queryKey: ["research"] }, (old) =>
        old?.map((item) => item.id === id ? { ...item, is_archived: !item.is_archived } : item)
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["research"] }),
  })
}
