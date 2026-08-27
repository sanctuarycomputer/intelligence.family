import type { Metadata } from 'next';

const title = 'Research · Family Intelligence';
const description = 'Speculative Research by USB Club and garden3d';

// Next.js replaces the parent openGraph/twitter wholesale (images do not
// merge down), so re-declare the shared card here. Without this, scrapers
// fall back to the largest in-page image for the share preview.
const shareImage = '/research/fam-og-image.png';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function ResearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
