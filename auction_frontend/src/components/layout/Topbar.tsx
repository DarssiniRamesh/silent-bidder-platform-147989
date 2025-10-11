"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Application top bar with slot areas.
 */
export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
}

export function Topbar({ start, center, end, className, ...rest }: TopbarProps) {
  return (
    <header
      className={["w-full h-14 border-b border-[--border] bg-[--surface] text-[--text] flex items-center px-4", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="flex items-center gap-2 min-w-[160px]">{start}</div>
      <div className="flex-1 flex items-center justify-center">{center}</div>
      <div className="flex items-center gap-2 min-w-[160px] justify-end">{end}</div>
    </header>
  );
}

export default Topbar;
