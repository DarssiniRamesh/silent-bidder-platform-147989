"use client";

import Link from "next/link";
import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export type ItemCardProps = {
  item: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    startingPrice: number;
    status: "open" | "closed" | "draft";
    highestBidAmount?: number;
    bidCount?: number;
  };
  href: string;
};

/**
 * PUBLIC_INTERFACE
 * Card to display auction item summary with status and current bid.
 */
export default function ItemCard({ item, href }: ItemCardProps) {
  const highest = item.highestBidAmount ?? item.startingPrice;
  const isClosed = item.status !== "open";

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md">
      <Card className="transition hover:shadow-[var(--shadow-md)]">
        <div className="p-4 space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
            <Badge variant={isClosed ? "warning" : "primary"}>{isClosed ? "Closed" : "Open"}</Badge>
          </div>
          <p className="text-gray-600 line-clamp-2 text-sm">
            {item.description || "No description."}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Current bid</div>
            <div className="font-semibold">${highest.toFixed(2)}</div>
          </div>
          <div className="text-xs text-gray-500">Bids: {item.bidCount ?? 0}</div>
        </div>
      </Card>
    </Link>
  );
}
