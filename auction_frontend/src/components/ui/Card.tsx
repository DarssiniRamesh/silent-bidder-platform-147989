"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Card container with surface styling and optional header/footer slots.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ header, footer, className, children, ...rest }: CardProps) {
  return (
    <div
      className={["surface p-4 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {header ? <div className="mb-3">{header}</div> : null}
      <div>{children}</div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

export default Card;
