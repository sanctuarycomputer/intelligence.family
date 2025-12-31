import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Intelligence",
  description: "Bringing memories back home. Speculative Research in local LLMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
