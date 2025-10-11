"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Tabs with keyboard navigation and ARIA roles.
 */
export interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTabId, onChange, className }: TabsProps) {
  const [active, setActive] = React.useState<string>(defaultTabId ?? tabs[0]?.id);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (onChange && active) onChange(active);
  }, [active, onChange]);

  function handleKeyDown(e: React.KeyboardEvent) {
    const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!items || !items.length) return;
    const idx = Array.from(items).findIndex((el) => el.getAttribute("data-id") === active);
    if (idx < 0) return;

    const prev = () => items[(idx - 1 + items.length) % items.length].focus();
    const next = () => items[(idx + 1) % items.length].focus();

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prev();
        break;
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        next();
        break;
      case "Home":
        e.preventDefault();
        items[0].focus();
        break;
      case "End":
        e.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Tabs"
        className="inline-flex gap-1 p-1 rounded-[var(--radius-md)] border border-[--border] bg-[--surface]"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              data-id={t.id}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={[
                "px-3 py-1.5 rounded-[10px] text-sm transition",
                selected
                  ? "bg-[--primary] text-white shadow-[var(--shadow-sm)]"
                  : "text-[--text] hover:bg-[#eef2ff]"
              ].join(" ")}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" aria-labelledby={active} className="mt-3">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}

export default Tabs;
