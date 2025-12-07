import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, image, url }) {
    const defaultTitle = 'CommandVault - AI Prompt Storage & Sharing Platform';
    const defaultDescription = 'Store, share, and discover AI prompts. A social platform for prompt engineers to collaborate, save favorites, and find trending prompts.';
    const defaultKeywords = 'AI prompts, prompt engineering, ChatGPT prompts, AI tools, prompt library';
    const defaultImage = '/og-image.png';
    const defaultUrl = 'https://commandvault.com';

    const seoTitle = title ? `${title} | CommandVault` : defaultTitle;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoImage = image || defaultImage;
    const seoUrl = url || defaultUrl;

    return (
        <Helmet>
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />

            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:url" content={seoUrl} />

            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={seoImage} />
            <meta name="twitter:url" content={seoUrl} />
        </Helmet>
    );
}
