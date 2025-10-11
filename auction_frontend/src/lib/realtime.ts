import { SupabaseClient } from "@supabase/supabase-js";

/**
 * PUBLIC_INTERFACE
 * Subscribe to Postgres changes for a table; returns unsubscribe function.
 */
export function subscribeToTable<T>(
  supabase: SupabaseClient,
  table: string,
  onInsertOrUpdate: (payload: { new: T; old: T | null }) => void
) {
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload: { new: T; old: T | null }) => {
        onInsertOrUpdate({ new: payload.new, old: payload.old });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
