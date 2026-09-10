import type { Metadata } from 'next';

const title = 'Reserve the Flagship · Family Intelligence';
const description =
  'The most capable AI assistant you can put in a home. $899 at launch. Hold one of 250 founder units with a $49 refundable deposit.';
const shareImage = '/research/fam-og-image.png';

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

export default function PreorderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
