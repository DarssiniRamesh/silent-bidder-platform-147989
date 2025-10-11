"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import type { Database } from "@/types/db";
import { Loader } from "@/components/ui/Loader";

type BidRow = {
  id: string;
  amount: number;
  created_at: string;
  bidder_id: string | null;
};

/**
 * PUBLIC_INTERFACE
 * Live list of recent bids for an item.
 */
export default function BidList({ itemId }: { itemId: string }) {
  const supabase = useMemo(() => createClient<Database>(), []);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<BidRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("id,amount,created_at,bidder_id")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error) {
        setBids((data ?? []) as BidRow[]);
      }
      setLoading(false);
    })();

    const unsub = subscribeToTable<BidRow & { item_id: string }>(supabase, "bids", (payload) => {
      const b = payload.new;
      if (b.item_id !== itemId) return;
      setBids((prev) => {
        const next = [b as BidRow, ...prev];
        return next.slice(0, 20);
      });
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader size="sm" />
        Loading bids…
      </div>
    );
  }

  if (bids.length === 0) {
    return <div className="text-sm text-gray-600">No bids yet. Be the first!</div>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {bids.map((b) => (
        <li key={b.id} className="py-2 flex items-center justify-between text-sm">
          <span>${Number(b.amount).toFixed(2)}</span>
          <span className="text-gray-500">
            {new Date(b.created_at).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
