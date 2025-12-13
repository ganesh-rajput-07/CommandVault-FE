import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import PromptCardEnhanced from '../components/PromptCardEnhanced';
import OutputTypeFilter from '../components/OutputTypeFilter';
import SEO from '../components/SEO';
import usePrompts from '../hooks/usePrompts';
import useNotifications from '../hooks/useNotifications';
import './Dashboard.css';
import './Trending.css';

const Trending = () => {
    const { unreadCount } = useNotifications();
    const { setPrompts: setGlobalPrompts } = usePrompts();
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState([]);
    const [filteredPrompts, setFilteredPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOutputTypes, setSelectedOutputTypes] = useState(['all']);
    const [selectedModel, setSelectedModel] = useState('all');

    const AI_MODELS = ['all', 'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Other'];

    useEffect(() => {
        fetchTrendingPrompts();
    }, [selectedModel, selectedOutputTypes]);

    const fetchTrendingPrompts = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();

            if (selectedModel !== 'all') {
                params.append('ai_model', selectedModel);
            }

            const queryString = params.toString();
            const endpoint = queryString ? `prompts/trending/?${queryString}` : 'prompts/trending/';

            const res = await api.get(endpoint);
            let data = res.data.results || res.data;

            // Filter by output type on client side
            if (!selectedOutputTypes.includes('all') && selectedOutputTypes.length > 0) {
                data = data.filter(p => selectedOutputTypes.includes(p.output_type));
            }

            setPrompts(data);
            setFilteredPrompts(data);
            setGlobalPrompts(data); // Update global state
        } catch (error) {
            console.error('Error fetching trending prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed handlePromptClick - handled by PromptCardEnhanced

    return (
        <>
            <SEO title="Trending Prompts" description="Top rated and most viewed prompts from the community" />
            <Navbar unreadCount={unreadCount} />

            <div className="dashboard-container">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-background"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Trending <span className="gradient-text">Prompts</span>
                        </h1>
                        <p className="hero-subtitle">
                            Top rated and most viewed prompts from the community
                        </p>

                        {/* Quick Stats */}
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-value">{prompts.length}</span>
                                <span className="stat-label">Trending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="filters-container">
                        {/* AI Model Filters */}
                        <div className="filter-group">
                            <span className="filter-label">AI Model:</span>
                            <div className="filter-chips">
                                {AI_MODELS.map(model => (
                                    <button
                                        key={model}
                                        className={`filter-chip ${selectedModel === model ? 'active' : ''}`}
                                        onClick={() => setSelectedModel(model)}
                                    >
                                        {model === 'all' ? 'All Models' : model}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Output Type Filter */}
                        <OutputTypeFilter
                            selectedTypes={selectedOutputTypes}
                            onChange={setSelectedOutputTypes}
                        />
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="loading-container">
                        <LoadingSpinner />
                    </div>
                ) : filteredPrompts.length === 0 ? (
                    <div className="empty-state">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3>No trending prompts yet</h3>
                        <p>Be the first to share something amazing!</p>
                        <button className="btn-clear-filters" onClick={() => navigate('/explore')}>
                            Explore Prompts
                        </button>
                    </div>
                ) : (
                    <div className="prompts-grid trending-prompts-grid">
                        {filteredPrompts.map((prompt, index) => (
                            <div key={prompt.id} className="trending-card-wrapper" style={{ position: 'relative' }}>
                                <div className="rank-badge trending-rank">#{index + 1}</div>
                                <PromptCardEnhanced
                                    prompt={prompt}
                                    showActions={false}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Trending;

