import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Silent Auction",
  description: "Real-time silent auction platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
