import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

import SEO from '../components/SEO';
import api from '../api';
import './ImageEditor.css';

export default function ImageEditor() {
    const { slug } = useParams();
    const [promptText, setPromptText] = useState('');
    const [referenceImage, setReferenceImage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    // Settings State
    const [model, setModel] = useState('stable-diffusion-xl');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [steps, setSteps] = useState(30);
    const [cfgScale, setCfgScale] = useState(7);

    useEffect(() => {
        if (slug) {
            // Fetch prompt details if slug is present
            const fetchPrompt = async () => {
                try {
                    const res = await api.get(`prompts/${slug}/`);
                    setPromptText(res.data.text);
                    if (res.data.ai_model) {
                        // Simple heuristic to match model if possible, otherwise default
                        const modelStr = String(res.data.ai_model).toLowerCase();
                        if (modelStr.includes('dall')) setModel('dall-e-3');
                        else if (modelStr.includes('midjourney')) setModel('midjourney-v6');
                        else if (modelStr.includes('flux')) setModel('flux-1');
                        else setModel('stable-diffusion-xl');
                    }
                } catch (error) {
                    console.error("Error fetching prompt for editor:", error);
                }
            };
            fetchPrompt();
        }
    }, [slug]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setGeneratedImage(null);

        // Simulate generation API call
        setTimeout(() => {
            setIsGenerating(false);
            // Mock result - in real app this comes from backend
            // Using a placeholder image service for demo
            const seed = Math.floor(Math.random() * 1000);
            const [w, h] = aspectRatio.split(':').map(Number);
            const width = 1024;
            const height = Math.floor(width * (h / w));

            setGeneratedImage(`https://picsum.photos/seed/${seed}/${width}/${height}`);
        }, 3000);
    };

    return (
        <div className="image-editor-page">
            <SEO
                title={slug ? "Remix Prompt" : "Studio"}
                description="Create and generate AI images with PromptDeck Studio."
            />
            <aside className="editor-sidebar">
                <Link to="/explore" className="back-nav">
                    ← Back to Dashboard
                </Link>

                <div className="sidebar-header">
                    <h2>PromptDeck Studio</h2>
                </div>

                <div className="control-group">
                    <label>AI Model</label>
                    <select
                        className="select-input"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    >
                        <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                        <option value="dall-e-3">DALL-E 3</option>
                        <option value="midjourney-v6">Midjourney v6 (via Proxy)</option>
                        <option value="flux-1">Flux 1.0</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>Aspect Ratio</label>
                    <select
                        className="select-input"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                    >
                        <option value="1:1">1:1 Square</option>
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                        <option value="4:3">4:3 Standard</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>Sampling Steps ({steps})</label>
                    <div className="range-wrap">
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={steps}
                            onChange={(e) => setSteps(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>
                </div>

                <div className="control-group">
                    <label>CFG Scale ({cfgScale})</label>
                    <div className="range-wrap">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.5"
                            value={cfgScale}
                            onChange={(e) => setCfgScale(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>
                </div>
            </aside>

            <main className="editor-main">
                <div className="prompt-input-area">
                    <textarea
                        className="prompt-textarea"
                        placeholder="Describe your imagination here... (e.g., A futuristic cyberpunk city with neon lights)"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                    />
                </div>

                <div className="upload-section">
                    <ImageUploader
                        onImageSelect={(file, preview) => setReferenceImage(preview)}
                        initialImage={referenceImage}
                    />
                </div>

                <div className="actions-bar" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating || !promptText.trim()}
                    >
                        {isGenerating ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                                Generate
                            </>
                        )}
                    </button>
                </div>

                <div className="results-area">
                    {generatedImage ? (
                        <div className="result-container" style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
                            <img
                                src={generatedImage}
                                alt="Generated Result"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', background: 'rgba(0,0,0,0.5)' }}
                            />
                        </div>
                    ) : (
                        <div className={`result-placeholder ${isGenerating ? 'generating' : ''}`}>
                            {isGenerating ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    <p>Creating your masterpiece...</p>
                                </>
                            ) : (
                                <>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, marginBottom: '1rem' }}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <p>Generated artwork will appear here</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
