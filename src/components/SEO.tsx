import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterHandle?: string;
  schemaMarkup?: object;
}

export default function SEO({
  title = "GSTSmartAI.com - High-Precision India Tax AI",
  description = "Premium AI-powered GST Compliance suite for Indian Tax Professionals. Notice Responder, ITR Planner, and Professional Invoicing.",
  canonical = "https://gstsmartai.com",
  ogType = "website",
  ogImage = "https://gstsmartai.com/og-image.jpg",
  twitterHandle = "@gstsmartai",
  schemaMarkup
}: SEOProps) {
  const fullTitle = `${title} | GSTSmartAI.com`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Structured Data */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
}
