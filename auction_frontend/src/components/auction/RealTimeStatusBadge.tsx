"use client";

import React, { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";

/**
 * PUBLIC_INTERFACE
 * Shows realtime connection state; basic simulated online indicator for now.
 */
export default function RealTimeStatusBadge() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <Badge variant={online ? "success" : "destructive"}>
      {online ? "Live" : "Offline"}
    </Badge>
  );
}
