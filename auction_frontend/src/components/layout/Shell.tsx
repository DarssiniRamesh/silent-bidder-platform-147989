"use client";

import React from "react";
import Sidebar, { SidebarProps } from "./Sidebar";
import Topbar, { TopbarProps } from "./Topbar";

/**
 * PUBLIC_INTERFACE
 * App Shell layout combining Sidebar, Topbar, and content area.
 */
export interface ShellProps {
  sidebar?: SidebarProps;
  topbar?: TopbarProps;
  children: React.ReactNode;
}

export function Shell({ sidebar, topbar, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-[--background] text-[--text]">
      <div className="flex">
        {sidebar ? <Sidebar {...sidebar} /> : null}
        <div className="flex-1 min-w-0">
          {topbar ? <Topbar {...topbar} /> : null}
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
