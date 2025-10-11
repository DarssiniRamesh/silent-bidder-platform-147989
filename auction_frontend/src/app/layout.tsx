import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";
import { Shell } from "@/components/layout/Shell";
import { Toaster } from "@/components/ui/Toast";

/**
 * Root application metadata for Next.js App Router
 */
export const metadata: Metadata = {
  title: "Silent Bidder - Real-time Auctions",
  description: "Create and join silent auctions with real-time, anonymous bidding.",
  applicationName: "Silent Bidder",
  authors: [{ name: "Silent Bidder" }],
  keywords: ["auction", "silent", "bidding", "real-time", "supabase"],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563EB",
};

/**
 * PUBLIC_INTERFACE
 * RootLayout wraps the entire application with the Shell layout and Toaster provider.
 * It ensures consistent top-level structure, theming, and global notifications.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster>
          <Shell>{children}</Shell>
        </Toaster>
      </body>
    </html>
  );
}
