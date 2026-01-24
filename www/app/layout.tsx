import type { Metadata } from "next";
import "./globals.css";
import EmailGateWrapper from "@/components/EmailGateWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://intelligence.family"),
  title: "Family Intelligence",
  description: "Speculative Research by USB Club and garden3d",
  openGraph: {
    title: "Family Intelligence",
    description: "Speculative Research by USB Club and garden3d",
    images: [
      {
        url: "/research/fam-og-image.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Intelligence",
    description: "Speculative Research by USB Club and garden3d",
    images: ["/research/fam-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <EmailGateWrapper>
          {children}
        </EmailGateWrapper>
      </body>
    </html>
  );
}
