import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `${BRAND_NAME}: traceable, transparent, trusted food journeys.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
