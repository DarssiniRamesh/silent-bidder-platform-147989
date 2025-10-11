"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { getOrCreateAnonymousId } from "@/lib/session/anonymousId";
import { z } from "zod";
import Card from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import ItemCard from "@/components/auction/ItemCard";
import RealTimeStatusBadge from "@/components/auction/RealTimeStatusBadge";
import type { Database } from "@/types/db";

/**
 * PUBLIC_INTERFACE
 * Event public page to view active items for a given event, with realtime updates on items.
 */
const EventByNameSchema = z.object({
  name: z.string().min(1),
});

type Item = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starting_price: number;
  status: "open" | "closed" | "draft";
  event_id: string;
  highest_bid_amount?: number | null;
  bid_count?: number;
};

export default function EventByNamePage({
  params,
}: {
  params: { name: string };
}) {
  const { show } = useToast();
  const supabase = useMemo(() => createClient<Database>(), []);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeItems: (() => void) | null = null;
    let unsubscribeBids: (() => void) | null = null;

    (async () => {
      try {
        await getOrCreateAnonymousId();

        const parsed = EventByNameSchema.safeParse({ name: params.name });
        if (!parsed.success) {
          setError("Invalid event name.");
          setLoading(false);
          return;
        }

        const { data: eventData, error: eventErr } = await supabase
          .from("events")
          .select("id,title,name,status")
          .eq("name", params.name)
          .single();

        if (eventErr || !eventData) {
          setError("Event not found.");
          setLoading(false);
          return;
        }
        setEventId(eventData.id);
        setEventTitle(eventData.title || eventData.name);

        const { data: itemsData, error: itemsErr } = await supabase
          .from("items_view")
          .select(
            "id,title,description,image_url,starting_price,status,event_id,highest_bid_amount,bid_count"
          )
          .eq("event_id", eventData.id)
          .neq("status", "draft");

        let normalized: Item[] = [];
        if (itemsErr) {
          const { data: baseItems, error: baseErr } = await supabase
            .from("items")
            .select("id,title,description,image_url,starting_price,status,event_id")
            .eq("event_id", eventData.id)
            .neq("status", "draft");
          if (baseErr) throw baseErr;

          const ids = baseItems?.map((i) => i.id) ?? [];
          if (ids.length > 0) {
            const { data: bids, error: bidsErr } = await supabase
              .from("bids")
              .select("item_id,amount")
              .in("item_id", ids);
            if (bidsErr) throw bidsErr;

            const byItem = new Map<string, { max: number; count: number }>();
            bids?.forEach((b) => {
              const cur = byItem.get(b.item_id) ?? { max: 0, count: 0 };
              byItem.set(b.item_id, {
                max: Math.max(cur.max, b.amount ?? 0),
                count: cur.count + 1,
              });
            });

            normalized =
              baseItems?.map((i) => ({
                ...i,
                highest_bid_amount: byItem.get(i.id)?.max ?? null,
                bid_count: byItem.get(i.id)?.count ?? 0,
              })) ?? [];
          } else {
            normalized = baseItems ?? [];
          }
        } else {
          normalized = (itemsData as Item[]) ?? [];
        }

        setItems(normalized);
        setLoading(false);

        // realtime
        unsubscribeItems = subscribeToTable<Item>(supabase, "items", (payload) => {
          const rec = payload.new as Item;
          if (rec.event_id !== eventData.id) return;
          setItems((prev) => {
            const idx = prev.findIndex((p) => p.id === rec.id);
            if (idx === -1) return prev.concat(rec);
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...rec };
            return copy;
          });
        });

        unsubscribeBids = subscribeToTable<{ item_id: string; amount: number }>(supabase, "bids", (payload) => {
          const bid = payload.new as { item_id: string; amount: number };
          setItems((prev) => {
            const idx = prev.findIndex((p) => p.id === bid.item_id);
            if (idx === -1) return prev;
            const item = prev[idx];
            const highest =
              item.highest_bid_amount != null
                ? Math.max(item.highest_bid_amount, bid.amount ?? 0)
                : bid.amount ?? item.starting_price;
            const count = (item.bid_count ?? 0) + 1;
            const copy = [...prev];
            copy[idx] = { ...item, highest_bid_amount: highest, bid_count: count };
            return copy;
          });
        });
      } catch (e: unknown) {
        const msg = typeof e === "object" && e && "message" in e ? String((e as any).message) : "Failed to load event.";
        setError(msg);
        setLoading(false);
        show("error", "Unable to load event. Please try again.");
      }
    })();

    return () => {
      unsubscribeItems?.();
      unsubscribeBids?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.name]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3">
          <Loader />
          <span>Loading event…</span>
        </div>
      </div>
    );
  }

  if (error || !eventId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <div className="p-6">
            <h1 className="text-xl font-semibold mb-2">Event</h1>
            <p className="text-red-600">{error ?? "Event not found."}</p>
            <div className="mt-4">
              <Link href="/" className="text-blue-600 hover:underline">
                Go back home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{eventTitle}</h1>
          <p className="text-gray-600">Browse items and place bids anonymously.</p>
        </div>
        <RealTimeStatusBadge />
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="p-6">
            <p>No items available yet. Please check back later.</p>
          </div>
        </Card>
      ) : (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                description: item.description ?? "",
                imageUrl: item.image_url ?? undefined,
                startingPrice: item.starting_price,
                status: item.status,
                highestBidAmount: item.highest_bid_amount ?? undefined,
                bidCount: item.bid_count ?? 0,
              }}
              href={`/event/${encodeURIComponent(params.name)}/item/${item.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
