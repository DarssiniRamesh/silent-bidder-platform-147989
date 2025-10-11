"use client";

/**
 * Utilities for generating and persisting an anonymous ID in localStorage.
 * The ID is a UUID and is valid for 1 year from creation.
 */

const STORAGE_KEY = "sbp.anonymousId.v1";
const STORAGE_TS_KEY = "sbp.anonymousId.createdAt";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// PUBLIC_INTERFACE
export function getAnonymousId(): string {
  if (typeof window === "undefined") {
    // On server, return a temporary id (not persisted)
    return generateUUID();
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    const createdAt = window.localStorage.getItem(STORAGE_TS_KEY);

    if (existing && createdAt) {
      const created = Number(createdAt);
      if (!Number.isNaN(created) && Date.now() - created < ONE_YEAR_MS) {
        return existing;
      }
    }

    const id = generateUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
    window.localStorage.setItem(STORAGE_TS_KEY, Date.now().toString());
    return id;
  } catch {
    // Fallback in restrictive environments
    return generateUUID();
  }
}

// PUBLIC_INTERFACE
export function clearAnonymousId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_TS_KEY);
  } catch {
    // ignore
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    // Use bitwise ops for compact random hex generation
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
