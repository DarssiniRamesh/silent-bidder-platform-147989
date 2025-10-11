"use client";

import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

/**
 * PUBLIC_INTERFACE
 * Bid form with validation and accessibility, exposes onSubmit(amount)
 */
export default function BidForm({
  minAmount,
  disabled,
  onSubmit,
  actionButtonRef,
}: {
  minAmount: number;
  disabled?: boolean;
  onSubmit: (amount: number) => Promise<void> | void;
  actionButtonRef?: React.RefObject<HTMLButtonElement>;
}) {
  const { show } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const schema = z
    .object({
      amount: z.coerce.number().positive(),
    })
    .refine((v) => v.amount >= minAmount, {
      message: `Bid must be at least $${minAmount.toFixed(2)}`,
      path: ["amount"],
    });

  useEffect(() => {
    // focus input for quick keyboard flow
    inputRef.current?.focus();
  }, [minAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const parsed = schema.safeParse({ amount });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid amount";
      show("error", `Invalid bid: ${msg}`);
      inputRef.current?.focus();
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(parsed.data.amount);
      setAmount("");
      // Move focus to main action (Place bid button) for quick repeat
      actionButtonRef?.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        ref={inputRef}
        type="number"
        min={minAmount}
        step="0.01"
        value={amount}
        disabled={disabled || submitting}
        onChange={(e) => setAmount(e.target.value)}
        label="Your bid amount (USD)"
        description={`Minimum acceptable bid is $${minAmount.toFixed(2)}.`}
        placeholder={`${minAmount.toFixed(2)} or higher`}
      />
      <Button
        type="submit"
        disabled={disabled || submitting}
        ref={actionButtonRef}
        aria-disabled={disabled || submitting}
      >
        {submitting ? "Submitting…" : "Place bid"}
      </Button>
    </form>
  );
}
