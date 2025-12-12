import React, { useState, useEffect } from 'react';
import api from '../api';
import PromptDetailModal from '../components/PromptDetailModal';
import Navbar from '../components/Navbar';
import PromptCard from '../components/PromptCard';
import './Trending.css';

const Trending = () => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchTrendingPrompts();
    }, []);

    const fetchTrendingPrompts = async () => {
        try {
            setLoading(true);
            const res = await api.get('vault/prompts/trending/');
            // API returns { results: [...] } for paginated or [...] for list
            const data = res.data.results || res.data;
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching trending prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptClick = (prompt) => {
        setSelectedPrompt(prompt);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPrompt(null);
    };

    const handleUpdatePrompt = (updatedPrompt) => {
        setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
        if (selectedPrompt && selectedPrompt.id === updatedPrompt.id) {
            setSelectedPrompt(updatedPrompt);
        }
    };

    return (
        <div className="trending-page">
            <Navbar />

            <main className="trending-container">
                <header className="trending-header">
                    <h1 className="gradient-text">Trending Prompts</h1>
                    <p>Top rated and most viewed prompts from the community</p>
                </header>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="trending-grid">
                        {prompts.map((prompt, index) => (
                            <div key={prompt.id} className={`trending-card-wrapper rank-${index + 1}`}>
                                <div className="rank-badge">#{index + 1}</div>
                                <div className="rank-stats">
                                    <span className="stat"><span className="icon">🔥</span> {prompt.like_count} Likes</span>
                                    <span className="stat"><span className="icon">👁️</span> {prompt.times_used} Views</span>
                                </div>
                                <PromptCard
                                    prompt={prompt}
                                    onClick={() => handlePromptClick(prompt)}
                                    onUpdate={handleUpdatePrompt}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && prompts.length === 0 && (
                    <div className="empty-state">
                        <h3>No trending prompts yet</h3>
                        <p>Be the first to share something amazing!</p>
                    </div>
                )}
            </main>

            {isModalOpen && selectedPrompt && (
                <PromptDetailModal
                    prompt={selectedPrompt}
                    onClose={handleCloseModal}
                    onUpdate={handleUpdatePrompt}
                />
            )}
        </div>
    );
};

export default Trending;
