import type { Metadata } from "next";

const title = "Fundraising · Family Intelligence";
const description =
  "We're raising $25M to ship the first device in a new category: beautiful consumer hardware running a fully local AI stack, never exposed to the cloud.";

export const metadata: Metadata = {
  title,
  description,
  // Semi-private page: keep it out of search indexes
  robots: { index: false, follow: false },
  openGraph: { title, description },
  twitter: { title, description },
};

export default function FundraisingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
