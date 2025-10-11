"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { DBBid, DBItem } from "@/types/db";

/**
 * Handler signatures for realtime changes.
 */
export type ChangeType = "INSERT" | "UPDATE" | "DELETE";
export type RealtimeHandler<T> = (payload: {
  type: ChangeType;
  new?: T | null;
  old?: T | null;
}) => void;

export type ConnectionStateHandler = (state: "connecting" | "connected" | "reconnecting" | "disconnected") => void;

type SubscriptionHandlers<T> = {
  onChange?: RealtimeHandler<T>;
  onConnectionStateChange?: ConnectionStateHandler;
};

function wireConnectionState(channel: RealtimeChannel, onState?: ConnectionStateHandler) {
  if (!onState) return;
  // Supabase JS emits on 'connected', 'subscribed', 'reconnecting', 'closed'
  onState("connecting");
  channel.on("system", { event: "connected" }, () => onState("connected"));
  channel.on("system", { event: "reconnecting" }, () => onState("reconnecting"));
  channel.on("system", { event: "closed" }, () => onState("disconnected"));
}

/**
 * PUBLIC_INTERFACE
 * subscribeToItemBids
 * Subscribes to realtime bid changes for a specific itemId.
 * Returns an unsubscribe function.
 */
export function subscribeToItemBids(
  itemId: string,
  handlers: SubscriptionHandlers<DBBid> = {}
): () => void {
  const supabase = getSupabaseClient();

  // Lazy channel creation; a unique channel for the item
  const channel = supabase
    .channel(`public:bids:item:${itemId}`, {
      config: { broadcast: { ack: true } },
    })
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bids", filter: `item_id=eq.${itemId}` },
      (payload) => {
        handlers.onChange?.({
          type: (payload.eventType as ChangeType) ?? "UPDATE",
          new: (payload.new as DBBid) ?? null,
          old: (payload.old as DBBid) ?? null,
        });
      }
    )
    .subscribe();

  wireConnectionState(channel, handlers.onConnectionStateChange);

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {
      // ignore
    }
  };
}

/**
 * PUBLIC_INTERFACE
 * subscribeToEventItems
 * Subscribes to realtime changes for items belonging to an event.
 * Returns an unsubscribe function.
 */
export function subscribeToEventItems(
  eventId: string,
  handlers: SubscriptionHandlers<DBItem> = {}
): () => void {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel(`public:items:event:${eventId}`, {
      config: { broadcast: { ack: true } },
    })
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "items", filter: `event_id=eq.${eventId}` },
      (payload) => {
        handlers.onChange?.({
          type: (payload.eventType as ChangeType) ?? "UPDATE",
          new: (payload.new as DBItem) ?? null,
          old: (payload.old as DBItem) ?? null,
        });
      }
    )
    .subscribe();

  wireConnectionState(channel, handlers.onConnectionStateChange);

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {
      // ignore
    }
  };
}
