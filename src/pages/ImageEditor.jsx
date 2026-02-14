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
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [steps, setSteps] = useState(30);
    const [cfgScale, setCfgScale] = useState(7);

    // Fetch available models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await api.get('ai/models/');
                setAvailableModels(res.data);
                if (res.data.length > 0) {
                    setSelectedModelId(res.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching AI models:", error);
            }
        };
        fetchModels();
    }, []);

    useEffect(() => {
        if (slug) {
            // Fetch prompt details if slug is present
            const fetchPrompt = async () => {
                try {
                    const res = await api.get(`prompts/${slug}/`);
                    setPromptText(res.data.text);
                    if (res.data.ai_model) {
                        // Improved matching logic: try to find a model in availableModels that matches the prompt's model string
                        const promptModel = String(res.data.ai_model).toLowerCase();
                        const match = availableModels.find(m =>
                            m.name.toLowerCase().includes(promptModel) ||
                            m.api_id.toLowerCase().includes(promptModel)
                        );
                        if (match) setSelectedModelId(match.id);
                    }
                } catch (error) {
                    console.error("Error fetching prompt for editor:", error);
                }
            };
            fetchPrompt();
        }
    }, [slug]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const res = await api.post('ai/generate/', {
                prompt: promptText,
                model_id: selectedModelId,
                params: {
                    aspect_ratio: aspectRatio,
                    steps: steps,
                    cfg_scale: cfgScale
                }
            });

            if (res.data.image_url) {
                setGeneratedImage(res.data.image_url);
            }
        } catch (error) {
            console.error("Generation error:", error);
            alert("Failed to generate image. Please check backend logs or try again.");
        } finally {
            setIsGenerating(false);
        }
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
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                    >
                        {availableModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                        ))}
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
