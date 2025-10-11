"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Badge for statuses and small highlights.
 */
export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "error";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  neutral: "bg-[#eef2ff] text-[#1e293b] border-[#c7d2fe]",
  primary: "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[--text] border-[color-mix(in_oklab,var(--primary)_40%,#dbeafe)]",
  success: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[#065f46] border-[color-mix(in_oklab,var(--success)_35%,#d1fae5)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[#7c2d12] border-[color-mix(in_oklab,var(--warning)_35%,#fef3c7)]",
  error: "bg-[color-mix(in_oklab,var(--error)_15%,transparent)] text-[#7f1d1d] border-[color-mix(in_oklab,var(--error)_35%,#fee2e2)]",
};

export function Badge({ variant = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={["inline-flex items-center gap-1 border text-xs font-medium px-2 py-0.5 rounded-[999px]", variantClass[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
