import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeartIcon, BookmarkIcon, EyeIcon } from '../components/AnimatedIcons';
import SEO from '../components/SEO';
import { AuthContext } from '../context/AuthContext';
import useNotifications from '../hooks/useNotifications';
import './Dashboard.css';
import './Trending.css';

const Trending = () => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingPrompts();
    }, []);

    const fetchTrendingPrompts = async () => {
        try {
            setLoading(true);
            const res = await api.get('prompts/trending/');
            const data = res.data.results || res.data;
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching trending prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptClick = (promptSlug) => {
        navigate(`/prompt/${promptSlug}`);
    };

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

                {/* Content Section */}
                {loading ? (
                    <div className="loading-container">
                        <LoadingSpinner />
                    </div>
                ) : prompts.length === 0 ? (
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
                        {prompts.map((prompt, index) => (
                            <div
                                key={prompt.id}
                                className={`prompt-card trending-card rank-${index + 1}`}
                                onClick={() => handlePromptClick(prompt.slug)}
                            >
                                <div className="rank-badge">#{index + 1}</div>

                                <div className="card-header">
                                    <div className="owner-info">
                                        {prompt.owner_avatar ? (
                                            <img src={prompt.owner_avatar} alt={prompt.owner_username} className="avatar-sm" />
                                        ) : (
                                            <div className="avatar-sm placeholder">
                                                {prompt.owner_username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="owner-name">{prompt.owner_username}</span>
                                    </div>
                                    {!prompt.is_public && (
                                        <span className="private-badge">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                            </svg>
                                            Private
                                        </span>
                                    )}
                                </div>

                                <h3 className="card-title">{prompt.title}</h3>
                                <p className="card-text">{prompt.text}</p>

                                {prompt.ai_model && (
                                    <div className="model-badge">{prompt.ai_model}</div>
                                )}

                                {prompt.tags && prompt.tags.length > 0 && (
                                    <div className="card-tags">
                                        {prompt.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="tag">{tag}</span>
                                        ))}
                                        {prompt.tags.length > 3 && (
                                            <span className="tag-more">+{prompt.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                <div className="rank-stats-inline">
                                    <span className="stat">
                                        <span className="icon">🔥</span> {prompt.like_count || 0}
                                    </span>
                                    <span className="stat">
                                        <span className="icon">👁️</span> {prompt.times_used || 0}
                                    </span>
                                </div>

                                <div className="card-stats">
                                    <span className="stat-item">
                                        <HeartIcon isLiked={prompt.is_liked_by_user || false} size={20} />
                                        <span className="stat-count">{prompt.like_count || 0}</span>
                                    </span>
                                    <span className="stat-item">
                                        <BookmarkIcon isSaved={prompt.is_saved_by_user || false} size={20} />
                                        <span className="stat-count">{prompt.saves_count || 0}</span>
                                    </span>
                                    <span className="stat-item">
                                        <EyeIcon isViewing={false} size={20} />
                                        <span className="stat-count">{prompt.usage_count || 0}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Trending;

