"use client";

import React from "react";
import Link from "next/link";

/**
 * PUBLIC_INTERFACE
 * App sidebar with navigation links.
 */
export interface SidebarProps {
  items?: { href: string; label: string; icon?: React.ReactNode }[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
}

export function Sidebar({ items = [], header, footer, collapsed }: SidebarProps) {
  return (
    <aside
      className={[
        "h-screen sticky top-0 border-r border-[--border] bg-[--surface] text-[--text] flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]"
      ].join(" ")}
      aria-label="Sidebar"
    >
      <div className="p-4">
        {header ?? (
          <div className="font-semibold text-[--text]">Silent Auction</div>
        )}
      </div>
      <nav className="flex-1 px-2 overflow-auto">
        <ul className="grid gap-1">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="flex items-center gap-3 px-3 py-2 rounded-[10px] hover:bg-[#f3f4f6] focus-visible:outline-[--ring]"
              >
                {it.icon ? <span aria-hidden>{it.icon}</span> : null}
                <span className={collapsed ? "sr-only" : ""}>{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {footer ? <div className="p-3 border-t border-[--border]">{footer}</div> : null}
    </aside>
  );
}

export default Sidebar;
