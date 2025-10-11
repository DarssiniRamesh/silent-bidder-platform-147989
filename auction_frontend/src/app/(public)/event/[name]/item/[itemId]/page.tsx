"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/realtime";
import { getOrCreateAnonymousId } from "@/lib/session/anonymousId";
import { z } from "zod";
import Card from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import BidForm from "@/components/auction/BidForm";
import BidList from "@/components/auction/BidList";
import RealTimeStatusBadge from "@/components/auction/RealTimeStatusBadge";
import type { Database } from "@/types/db";

/**
 * PUBLIC_INTERFACE
 * Item detail page with realtime highest bid and optimistic bid updates.
 */
const ParamsSchema = z.object({
  name: z.string().min(1),
  itemId: z.string().min(1),
});

type Item = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starting_price: number;
  status: "open" | "closed" | "draft";
  event_id: string;
};

export default function ItemDetailPage() {
  const params = useParams<{ name: string; itemId: string }>();
  const parsed = ParamsSchema.safeParse(params);
  const supabase = useMemo(() => createClient<Database>(), []);
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [highest, setHighest] = useState<number | null>(null);
  const [bidCount, setBidCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const bidButtonRef = useRef<HTMLButtonElement>(null);

  // track optimistic state
  const [optimisticBid, setOptimisticBid] = useState<number | null>(null);

  useEffect(() => {
    let unsubItem: (() => void) | null = null;
    let unsubBids: (() => void) | null = null;

    (async () => {
      try {
        if (!parsed.success) {
          setError("Invalid route parameters.");
          setLoading(false);
          return;
        }
        await getOrCreateAnonymousId();

        // Load item
        const { data: itemData, error: itemErr } = await supabase
          .from("items")
          .select("id,title,description,image_url,starting_price,status,event_id")
          .eq("id", parsed.data.itemId)
          .single();
        if (itemErr || !itemData) {
          setError("Item not found.");
          setLoading(false);
          return;
        }
        setItem(itemData);

        // Load aggregate highest and count
        const { data: aggData, error: aggErr } = await supabase
          .from("bids")
          .select("amount")
          .eq("item_id", parsed.data.itemId);
        if (aggErr) throw aggErr;
        const amounts = (aggData ?? []).map((b) => b.amount ?? 0);
        const highestAmount =
          amounts.length > 0 ? Math.max(...amounts) : itemData.starting_price;
        setHighest(amounts.length > 0 ? highestAmount : itemData.starting_price);
        setBidCount(amounts.length);

        setLoading(false);

        // Realtime subscriptions for this item
        unsubItem = subscribeToTable<Item>(supabase, "items", (payload) => {
          const rec = payload.new;
          if (!rec || rec.id !== parsed.data.itemId) return;
          setItem((prev) => ({ ...(prev ?? rec), ...rec }));
        });
        unsubBids = subscribeToTable<{ item_id: string; amount: number }>(supabase, "bids", (payload) => {
          const b = payload.new;
          if (!b || b.item_id !== parsed.data.itemId) return;
          setHighest((prev) => Math.max(prev ?? 0, b.amount ?? 0));
          setBidCount((c) => c + 1);
          // reconcile optimistic state if server surpasses
          setOptimisticBid((ob) => {
            if (ob == null) return ob;
            if (b.amount >= ob) return null;
            return ob;
          });
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = `New bid: $${(b.amount ?? 0).toFixed(
              2
            )}. Total bids ${bidCount + 1}.`;
          }
        });
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as any).message)
            : "Failed to load item.";
        setError(msg);
        setLoading(false);
        show("error", "Unable to load item details. Please try again.");
      }
    })();

    return () => {
      unsubItem?.();
      unsubBids?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.itemId]);

  const handlePlaceBid = async (amount: number) => {
    if (!item) return;
    try {
      // optimistic UI
      setOptimisticBid(amount);
      setHighest((prev) => Math.max(prev ?? 0, amount));
      // Do not increment bidCount yet; realtime will reconcile. But we can show pending feedback
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Bid submitted: $${amount.toFixed(
          2
        )}. Awaiting confirmation.`;
      }

      const anonId = await getOrCreateAnonymousId();
      const { error: insertErr } = await supabase.from("bids").insert({
        item_id: item.id,
        amount,
        bidder_id: anonId,
      } as Database["public"]["Tables"]["bids"]["Insert"]);

      if (insertErr) {
        // revert optimistic highest if it relied solely on this optimistic bid
        setOptimisticBid(null);
        // Optionally recompute highest by refetching quickly
        const { data: latest, error: refErr } = await supabase
          .from("bids")
          .select("amount")
          .eq("item_id", item.id);
        if (!refErr) {
          const amounts = (latest ?? []).map((b) => b.amount ?? 0);
          setHighest(
            amounts.length > 0
              ? Math.max(item.starting_price, ...amounts)
              : item.starting_price
          );
          setBidCount(amounts.length);
        }
        show("error", insertErr.message || "Your bid could not be placed. Please try again.");
      } else {
        show("success", "Your bid was submitted successfully.");
        // Move focus back to main action for keyboard users
        bidButtonRef.current?.focus();
      }
    } catch (e: unknown) {
      setOptimisticBid(null);
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as any).message)
          : "Please check your connection and try again.";
      show("error", msg);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3">
          <Loader />
          <span>Loading item…</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Card>
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Item</h1>
            <p className="text-red-600">{error ?? "Item not found."}</p>
            <div>
              <Link
                href={`/event/${encodeURIComponent(parsed.success ? parsed.data.name : "")}`}
                className="text-blue-600 hover:underline"
              >
                Back to event
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const isClosed = item.status !== "open";
  const displayHighest = optimisticBid ?? highest ?? item.starting_price;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          <p className="text-gray-600">Place your bid anonymously.</p>
        </div>
        <RealTimeStatusBadge />
      </div>

      <Card>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-64 object-cover rounded-md shadow"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
            <div className="space-y-2">
              <p className="text-gray-700">{item.description || "No description."}</p>
              <div className="flex items-center gap-2">
                <Badge variant={isClosed ? "warning" : "primary"}>
                  {isClosed ? "Closed" : "Open"}
                </Badge>
                <Badge variant="neutral">
                  Bids: {bidCount}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />
            <Card>
              <div className="p-4 space-y-2">
                <div className="text-gray-600">Current highest bid</div>
                <div className="text-3xl font-bold text-gray-900">
                  ${Number(displayHighest).toFixed(2)}
                </div>
                {optimisticBid != null && (
                  <div className="text-sm text-amber-600">Pending confirmation…</div>
                )}
              </div>
            </Card>

            <BidForm
              disabled={isClosed}
              minAmount={Math.max(item.starting_price, highest ?? item.starting_price)}
              onSubmit={handlePlaceBid}
              actionButtonRef={bidButtonRef}
            />

            {isClosed && (
              <div className="text-sm text-gray-600">
                Bidding is closed for this item.
              </div>
            )}

            <div>
              <Link
                href={`/event/${encodeURIComponent(parsed.data.name)}`}
                className="text-blue-600 hover:underline"
              >
                Back to event items
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bids</h2>
          <BidList itemId={item.id} />
        </div>
      </Card>
    </div>
  );
}
