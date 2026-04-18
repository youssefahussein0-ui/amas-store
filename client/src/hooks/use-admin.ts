import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return api.admin.stats.responses[200].parse(data);
    },
  });
}
