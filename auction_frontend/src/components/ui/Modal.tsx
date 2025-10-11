"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible modal dialog with focus trapping and keyboard support.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** Disable closing with Escape or overlay click */
  isBlocking?: boolean;
}

export function Modal({ open, onClose, title, description, children, isBlocking }: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const lastActive = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (open) {
      lastActive.current = document.activeElement;
      // focus first focusable in dialog
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isBlocking) {
          e.preventDefault();
          onClose();
        }
        if (e.key === "Tab") {
          // simple focus trap
          const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!nodes || nodes.length === 0) return;
          const focusables = Array.from(nodes).filter((n) => !n.hasAttribute("disabled"));
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    } else {
      // restore focus
      if (lastActive.current instanceof HTMLElement) {
        lastActive.current.focus();
      }
    }
  }, [open, onClose, isBlocking]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (isBlocking) return;
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_oklab,black_30%,transparent)] backdrop-blur-[1px]"
      aria-hidden={false}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        className="w-[min(92vw,640px)] surface rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-lg)]"
      >
        {title && (
          <h2 id="modal-title" className="text-lg font-semibold text-[--text]">
            {title}
          </h2>
        )}
        {description && (
          <p id="modal-desc" className="mt-1 text-sm text-[--muted]">
            {description}
          </p>
        )}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
