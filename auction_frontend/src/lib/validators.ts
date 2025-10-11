"use client";

import { z } from "zod";

/**
 * PUBLIC_INTERFACE
 * createEventSchema
 * Validates payload for creating an event.
 */
export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(120),
  hostEmail: z.string().email("Valid host email is required"),
});

/**
 * PUBLIC_INTERFACE
 * createItemSchema
 * Validates payload for creating an auction item.
 */
export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(160),
  description: z.string().max(2000).optional().or(z.literal("").transform(() => undefined)),
  imageUrl: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startingBid: z
    .number({ required_error: "Starting bid is required" })
    .finite()
    .nonnegative("Starting bid must be >= 0"),
});

/**
 * PUBLIC_INTERFACE
 * placeBidSchema
 * Validates payload for placing a bid.
 */
export const placeBidSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  amount: z
    .number({ required_error: "Bid amount is required" })
    .finite()
    .positive("Bid amount must be > 0"),
  anonymousId: z
    .string()
    .uuid("anonymousId must be a valid UUID"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
