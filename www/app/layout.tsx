import type { Metadata } from "next";
import "./globals.css";
import EmailGateWrapper from "@/components/EmailGateWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://intelligence.family"),
  title: "Family Intelligence",
  description: "Speculative Research by USB Club and garden3d",
  icons: {
    icon: [
      { url: "/research/leaf-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/research/leaf-favicon.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/research/leaf-favicon-180.png",
  },
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
