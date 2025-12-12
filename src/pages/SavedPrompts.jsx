import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { HeartIcon, BookmarkIcon, EyeIcon } from "../components/AnimatedIcons";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import "./Dashboard.css";

export default function SavedPrompts() {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSavedPrompts = async () => {
        setLoading(true);
        try {
            const res = await api.get('saved/my_saved/');
            // Extract prompts from saved objects
            const savedPrompts = (res.data.results || res.data).map(saved => saved.prompt);
            setPrompts(savedPrompts);
        } catch (error) {
            console.error('Error loading saved prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptClick = (promptSlug) => {
        navigate(`/prompt/${promptSlug}`);
    };

    const handleUnsave = async (e, promptId) => {
        e.stopPropagation();
        try {
            await api.post('saved/toggle/', { prompt_id: promptId });
            // Remove from list
            setPrompts(prev => prev.filter(p => p.id !== promptId));
        } catch (error) {
            console.error('Error unsaving prompt:', error);
        }
    };

    useEffect(() => {
        loadSavedPrompts();
    }, []);

    return (
        <>
            <SEO title="Saved Prompts" description="Your saved AI prompts collection" />
            <Navbar unreadCount={unreadCount} />

            <div className="dashboard-container">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-background"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Saved <span className="gradient-text">Prompts</span>
                        </h1>
                        <p className="hero-subtitle">
                            Your collection of bookmarked prompts
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="content-section">
                    <div className="content-wrapper">
                        {loading ? (
                            <div className="loading-container">
                                <LoadingSpinner />
                            </div>
                        ) : prompts.length === 0 ? (
                            <div className="empty-state">
                                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                                <h3>No saved prompts yet</h3>
                                <p>Start bookmarking prompts you find useful to build your collection</p>
                                <button className="btn-clear-filters" onClick={() => navigate('/explore')}>
                                    Explore Prompts
                                </button>
                            </div>
                        ) : (
                            <div className="prompts-grid">
                                {prompts.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        className="prompt-card"
                                        onClick={() => handlePromptClick(prompt.slug)}
                                    >
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

                                        <div className="card-stats">
                                            <span className="stat-item">
                                                <HeartIcon isLiked={prompt.is_liked_by_user || false} size={20} />
                                                <span className="stat-count">{prompt.likes_count || 0}</span>
                                            </span>
                                            <span className="stat-item">
                                                <BookmarkIcon isSaved={true} size={20} />
                                                <span className="stat-count">{prompt.saves_count || 0}</span>
                                            </span>
                                            <span className="stat-item">
                                                <EyeIcon isViewing={false} size={20} />
                                                <span className="stat-count">{prompt.usage_count || 0}</span>
                                            </span>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="action-btn unsave-btn"
                                                onClick={(e) => handleUnsave(e, prompt.id)}
                                                title="Remove from saved"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                                </svg>
                                                Unsave
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
