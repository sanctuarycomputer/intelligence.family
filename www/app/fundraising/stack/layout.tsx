import type { Metadata } from 'next';

const title = 'The Stack · Family Intelligence';
const description =
  'An exploded view of the family trunk: local AI hardware inside a sculptural enclosure.';

// Next.js replaces the parent openGraph/twitter wholesale (images do not
// merge down), so re-declare the shared card here, matching /fundraising.
const shareImage = '/research/fam-og-image.png';

export const metadata: Metadata = {
  title,
  description,
  // Semi-private page: keep it out of search indexes
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function StackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
