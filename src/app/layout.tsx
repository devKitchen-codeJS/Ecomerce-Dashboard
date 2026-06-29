import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Realtime E-commerce Analytics",
  description: "Realtime analytics dashboard for simulated e-commerce events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
