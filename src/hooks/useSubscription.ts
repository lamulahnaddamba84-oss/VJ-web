import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useActiveSubscription(userId?: string) {
  return useQuery({
    queryKey: ["subscription", "active", userId],
    enabled: !!userId,
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId!)
        .gt("ends_at", nowIso)
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
}
