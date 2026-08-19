import type { Metadata } from 'next';

const title = 'Opportunity · Family Intelligence';
const description =
  'The first device in a new category: beautiful consumer hardware running a fully local AI stack. Private intelligence, never exposed to the cloud.';

// Next.js replaces the parent openGraph/twitter wholesale (images do not
// merge down), so re-declare the shared card here. Without this, scrapers
// fall back to the largest in-page image for the share preview.
const shareImage = '/opportunity/og-opportunity.png';

export const metadata: Metadata = {
  title,
  description,
  // Semi-private page: keep it out of search indexes
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [shareImage],
  },
};

export default function OpportunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
