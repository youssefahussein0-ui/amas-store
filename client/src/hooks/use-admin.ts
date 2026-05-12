import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return api.admin.stats.responses[200].parse(data);
    },
  });
}

export function useClearAllData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Clear orders
      const res1 = await fetch(api.orders.deleteAll.path, { method: 'DELETE', credentials: "include" });
      if (!res1.ok) throw new Error("Failed to clear orders");
      
      // Clear leads
      const res2 = await fetch(api.admin.clearLeads.path, { method: 'DELETE', credentials: "include" });
      if (!res2.ok) throw new Error("Failed to clear leads");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
