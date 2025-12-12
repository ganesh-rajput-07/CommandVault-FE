// Comprehensive AI Models Database
export const AI_MODELS = [
    // Text Models
    {
        id: 'chatgpt-4',
        name: 'ChatGPT-4',
        category: 'Text',
        provider: 'OpenAI',
        description: 'Most capable GPT model',
        popular: true
    },
    {
        id: 'chatgpt-4-turbo',
        name: 'ChatGPT-4 Turbo',
        category: 'Text',
        provider: 'OpenAI',
        description: 'Faster GPT-4 variant',
        popular: true
    },
    {
        id: 'chatgpt-3.5',
        name: 'ChatGPT-3.5',
        category: 'Text',
        provider: 'OpenAI',
        description: 'Fast and efficient',
        popular: true
    },
    {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        category: 'Text',
        provider: 'Anthropic',
        description: 'Most intelligent Claude model',
        popular: true
    },
    {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        category: 'Text',
        provider: 'Anthropic',
        description: 'Balanced performance',
        popular: true
    },
    {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        category: 'Text',
        provider: 'Anthropic',
        description: 'Fastest Claude model',
        popular: false
    },
    {
        id: 'gemini-ultra',
        name: 'Gemini Ultra',
        category: 'Text',
        provider: 'Google',
        description: 'Most capable Gemini',
        popular: true
    },
    {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        category: 'Text',
        provider: 'Google',
        description: 'Best for scaling',
        popular: true
    },
    {
        id: 'gemini-nano',
        name: 'Gemini Nano',
        category: 'Text',
        provider: 'Google',
        description: 'On-device AI',
        popular: false
    },
    {
        id: 'llama-3',
        name: 'Llama 3',
        category: 'Text',
        provider: 'Meta',
        description: 'Open-source LLM',
        popular: true
    },
    {
        id: 'llama-2',
        name: 'Llama 2',
        category: 'Text',
        provider: 'Meta',
        description: 'Previous generation',
        popular: false
    },
    {
        id: 'mistral-large',
        name: 'Mistral Large',
        category: 'Text',
        provider: 'Mistral AI',
        description: 'Flagship model',
        popular: false
    },
    {
        id: 'mistral-medium',
        name: 'Mistral Medium',
        category: 'Text',
        provider: 'Mistral AI',
        description: 'Balanced model',
        popular: false
    },
    {
        id: 'cohere-command',
        name: 'Cohere Command',
        category: 'Text',
        provider: 'Cohere',
        description: 'Enterprise AI',
        popular: false
    },
    {
        id: 'perplexity',
        name: 'Perplexity AI',
        category: 'Text',
        provider: 'Perplexity',
        description: 'Search-focused AI',
        popular: false
    },

    // Image Models
    {
        id: 'midjourney-v6',
        name: 'Midjourney v6',
        category: 'Image',
        provider: 'Midjourney',
        description: 'Latest Midjourney',
        popular: true
    },
    {
        id: 'midjourney-v5',
        name: 'Midjourney v5',
        category: 'Image',
        provider: 'Midjourney',
        description: 'Previous version',
        popular: true
    },
    {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        category: 'Image',
        provider: 'OpenAI',
        description: 'Latest DALL-E',
        popular: true
    },
    {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        category: 'Image',
        provider: 'OpenAI',
        description: 'Previous DALL-E',
        popular: false
    },
    {
        id: 'stable-diffusion-xl',
        name: 'Stable Diffusion XL',
        category: 'Image',
        provider: 'Stability AI',
        description: 'High-res generation',
        popular: true
    },
    {
        id: 'stable-diffusion-2.1',
        name: 'Stable Diffusion 2.1',
        category: 'Image',
        provider: 'Stability AI',
        description: 'Improved quality',
        popular: false
    },
    {
        id: 'stable-diffusion-1.5',
        name: 'Stable Diffusion 1.5',
        category: 'Image',
        provider: 'Stability AI',
        description: 'Classic version',
        popular: false
    },
    {
        id: 'adobe-firefly',
        name: 'Adobe Firefly',
        category: 'Image',
        provider: 'Adobe',
        description: 'Commercial-safe AI',
        popular: true
    },
    {
        id: 'leonardo-ai',
        name: 'Leonardo AI',
        category: 'Image',
        provider: 'Leonardo',
        description: 'Game assets focused',
        popular: false
    },
    {
        id: 'ideogram',
        name: 'Ideogram',
        category: 'Image',
        provider: 'Ideogram',
        description: 'Text in images',
        popular: false
    },
    {
        id: 'playground-ai',
        name: 'Playground AI',
        category: 'Image',
        provider: 'Playground',
        description: 'Easy image creation',
        popular: false
    },

    // Video Models
    {
        id: 'runway-gen2',
        name: 'Runway Gen-2',
        category: 'Video',
        provider: 'Runway',
        description: 'Text to video',
        popular: true
    },
    {
        id: 'pika-labs',
        name: 'Pika Labs',
        category: 'Video',
        provider: 'Pika',
        description: 'AI video generation',
        popular: true
    },
    {
        id: 'stable-video',
        name: 'Stable Video Diffusion',
        category: 'Video',
        provider: 'Stability AI',
        description: 'Open-source video',
        popular: false
    },
    {
        id: 'synthesia',
        name: 'Synthesia',
        category: 'Video',
        provider: 'Synthesia',
        description: 'AI avatars',
        popular: false
    },

    // Audio Models
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        category: 'Audio',
        provider: 'ElevenLabs',
        description: 'Voice synthesis',
        popular: true
    },
    {
        id: 'suno-ai',
        name: 'Suno AI',
        category: 'Audio',
        provider: 'Suno',
        description: 'Music generation',
        popular: true
    },
    {
        id: 'mubert',
        name: 'Mubert',
        category: 'Audio',
        provider: 'Mubert',
        description: 'AI music',
        popular: false
    },
    {
        id: 'aiva',
        name: 'AIVA',
        category: 'Audio',
        provider: 'AIVA',
        description: 'Compose music',
        popular: false
    },

    // Code Models
    {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        category: 'Code',
        provider: 'GitHub',
        description: 'AI pair programmer',
        popular: true
    },
    {
        id: 'amazon-codewhisperer',
        name: 'Amazon CodeWhisperer',
        category: 'Code',
        provider: 'Amazon',
        description: 'Code suggestions',
        popular: false
    },
    {
        id: 'tabnine',
        name: 'Tabnine',
        category: 'Code',
        provider: 'Tabnine',
        description: 'AI code completion',
        popular: false
    },
    {
        id: 'replit-ghostwriter',
        name: 'Replit Ghostwriter',
        category: 'Code',
        provider: 'Replit',
        description: 'In-IDE AI',
        popular: false
    },
    {
        id: 'cursor',
        name: 'Cursor',
        category: 'Code',
        provider: 'Cursor',
        description: 'AI code editor',
        popular: true
    },

    // Other
    {
        id: 'other',
        name: 'Other',
        category: 'Other',
        provider: 'Custom',
        description: 'Custom AI model',
        popular: false
    }
];

export const MODEL_CATEGORIES = ['All', 'Text', 'Image', 'Video', 'Audio', 'Code', 'Other'];

// Helper function to search models
export const searchModels = (query, category = 'All') => {
    const lowerQuery = query.toLowerCase();

    return AI_MODELS.filter(model => {
        const matchesCategory = category === 'All' || model.category === category;
        const matchesSearch =
            model.name.toLowerCase().includes(lowerQuery) ||
            model.provider.toLowerCase().includes(lowerQuery) ||
            model.description.toLowerCase().includes(lowerQuery);

        return matchesCategory && matchesSearch;
    });
};

// Get popular models
export const getPopularModels = () => {
    return AI_MODELS.filter(model => model.popular);
};
