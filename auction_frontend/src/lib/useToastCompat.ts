"use client";

import { useToast as useToaster } from "@/src/components/ui/Toast";

/**
 * PUBLIC_INTERFACE
 * Compatibility wrapper to expose a { toast({title, description, tone}) } style API
 * mapped to the existing Toaster's useToast().show(type, message).
 */
export function useToastCompat() {
  const { show } = useToaster();
  return {
    // PUBLIC_INTERFACE
    toast(opts: { title: string; description?: string; tone?: "default" | "success" | "error" }) {
      /** This is a public function. */
      const type = opts.tone === "success" ? "success" : opts.tone === "error" ? "error" : "info";
      const message = opts.description ? `${opts.title}: ${opts.description}` : opts.title;
      show(type, message);
    },
  };
}
