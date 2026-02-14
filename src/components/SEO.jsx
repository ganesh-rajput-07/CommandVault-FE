import { Helmet } from "react-helmet-async";

export default function SEO({
    title,
    description,
    keywords,
    image,
    url,
    structuredData,
}) {
    const siteName = "PromptDeck";
    const defaultTitle = "PromptDeck - AI Prompt Storage & Sharing Platform";
    const defaultDescription =
        "Store, share, and discover AI prompts. A social platform for prompt engineers to collaborate, save favorites, and find trending prompts.";
    const defaultKeywords =
        "AI prompts, prompt engineering, ChatGPT prompts, AI tools, prompt library";
    const baseUrl = "https://prompt-deck.vercel.app";

    const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;

    const seoUrl = url ? `${baseUrl}${url}` : baseUrl;
    const seoImage = image
        ? `${baseUrl}${image}`
        : `${baseUrl}/og-image.png`;

    return (
        <Helmet>
            {/* Basic Meta */}
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />
            <link rel="canonical" href={seoUrl} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:url" content={seoUrl} />
            <meta property="og:image" content={seoImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={seoImage} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
