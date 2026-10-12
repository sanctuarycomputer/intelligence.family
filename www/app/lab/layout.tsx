import type { Metadata } from 'next';

const title = 'Lab · Family Intelligence';
const description =
  'A research lab for shared context and local AI, starting with the family.';
const shareImage = '/research/fam-og-image.png';

// A draft: kept out of search until the narrative is settled.
export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [shareImage],
  },
};

export default function LabLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
