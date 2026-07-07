import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voltaire",
  description: "AI agents that find anything you have interacted with.",
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
