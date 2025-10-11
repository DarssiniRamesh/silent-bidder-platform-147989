"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Loader spinner component.
 */
export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // px
  color?: string; // css color value
  label?: string; // accessible label (falls back to 'Loading…')
}

export function Loader({ size = 20, color = "var(--primary)", label = "Loading…", className, ...rest }: LoaderProps) {
  const border = Math.max(2, Math.round(size / 10));
  return (
    <div className={className} role="status" aria-live="polite" {...rest}>
      <span className="visually-hidden">{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderWidth: border,
          borderStyle: "solid",
          borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
          borderTopColor: color,
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 1s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span[aria-hidden="true"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Loader;
