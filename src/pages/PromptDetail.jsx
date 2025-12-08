import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import UserCard from "../components/UserCard";
import { HeartIcon, BookmarkIcon, EyeIcon } from "../components/AnimatedIcons";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import "./PromptDetail.css";

export default function PromptDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const [prompt, setPrompt] = useState(null);
    const [similarPrompts, setSimilarPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadPrompt();
        loadSimilarPrompts();
    }, [id]);

    const loadPrompt = async () => {
        try {
            const res = await api.get(`prompts/${id}/`);
            setPrompt(res.data);

            // Record view
            try {
                await api.post(`prompts/${id}/record_view/`);
            } catch (err) {
                console.error('Error recording view:', err);
            }
        } catch (error) {
            console.error('Error loading prompt:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSimilarPrompts = async () => {
        try {
            const res = await api.get(`prompts/${id}/similar/`);
            setSimilarPrompts(res.data.slice(0, 6)); // Show max 6 similar prompts
        } catch (error) {
            console.error('Error loading similar prompts:', error);
        }
    };

    const handleCopy = () => {
        if (prompt) {
            navigator.clipboard.writeText(prompt.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLike = async () => {
        try {
            await api.post('likes/toggle/', { prompt_id: id });
            const res = await api.get(`prompts/${id}/`);
            setPrompt(res.data);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.post('saved/toggle/', { prompt_id: id });
            const res = await api.get(`prompts/${id}/`);
            setPrompt(res.data);
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar unreadCount={unreadCount} />
                <div className="loading-container">
                    <LoadingSpinner />
                </div>
            </>
        );
    }

    if (!prompt) {
        return (
            <>
                <Navbar unreadCount={unreadCount} />
                <div className="error-container">
                    <h2>Prompt not found</h2>
                    <button onClick={() => navigate('/explore')} className="btn-back">
                        Back to Explore
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title={prompt.title} description={prompt.text.substring(0, 160)} />
            <Navbar unreadCount={unreadCount} />

            <div className="prompt-detail-container">
                {/* Back Button */}
                <button className="back-button" onClick={() => navigate(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Main Content */}
                <div className="detail-main-content">
                    {/* Creator Section */}
                    <div className="creator-section">
                        {prompt.owner && (
                            <UserCard
                                user={prompt.owner}
                                showFollowButton={true}
                                size="medium"
                            />
                        )}
                        <span className="upload-date">
                            {new Date(prompt.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="detail-title">{prompt.title}</h1>

                    {/* AI Model Badge */}
                    {prompt.ai_model && (
                        <div className="detail-model-badge">{prompt.ai_model}</div>
                    )}

                    {/* Prompt Content */}
                    <div className="prompt-content-section">
                        <div className="section-header">
                            <h3>Prompt</h3>
                            <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                                {copied ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="prompt-text-box">
                            {prompt.text}
                        </div>
                    </div>

                    {/* Example Output */}
                    {prompt.example_output && (
                        <div className="example-output-section">
                            <h3>Example Output</h3>
                            <div className="example-output-box">
                                {prompt.example_output}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                        <div className="tags-section">
                            <h3>Tags</h3>
                            <div className="tags-list">
                                {prompt.tags.map((tag, i) => (
                                    <span key={i} className="tag-item">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="detail-actions">
                        <button
                            className={`action-btn ${prompt.is_liked_by_user ? 'active' : ''}`}
                            onClick={handleLike}
                        >
                            <HeartIcon isLiked={prompt.is_liked_by_user || false} size={24} />
                            <span>{prompt.likes_count || 0} Likes</span>
                        </button>
                        <button
                            className={`action-btn ${prompt.is_saved_by_user ? 'active' : ''}`}
                            onClick={handleSave}
                        >
                            <BookmarkIcon isSaved={prompt.is_saved_by_user || false} size={24} />
                            <span>{prompt.saves_count || 0} Saves</span>
                        </button>
                        <button className="action-btn">
                            <EyeIcon isViewing={prompt.is_viewed_by_user || false} size={24} />
                            <span>{prompt.usage_count || 0} Views</span>
                        </button>
                    </div>
                </div>

                {/* Similar Prompts Section */}
                {similarPrompts.length > 0 && (
                    <div className="similar-prompts-section">
                        <h2>Similar Prompts</h2>
                        <div className="similar-prompts-grid">
                            {similarPrompts.map((similarPrompt) => (
                                <div
                                    key={similarPrompt.id}
                                    className="similar-prompt-card"
                                    onClick={() => navigate(`/prompt/${similarPrompt.id}`)}
                                >
                                    <div className="similar-card-header">
                                        {similarPrompt.owner && (
                                            <div className="similar-owner-info">
                                                {similarPrompt.owner.avatar ? (
                                                    <img src={similarPrompt.owner.avatar} alt={similarPrompt.owner.username} className="similar-avatar" />
                                                ) : (
                                                    <div className="similar-avatar-placeholder">
                                                        {similarPrompt.owner.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="similar-username">{similarPrompt.owner.username}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="similar-title">{similarPrompt.title}</h4>
                                    <p className="similar-text">{similarPrompt.text}</p>
                                    {similarPrompt.ai_model && (
                                        <div className="similar-model-badge">{similarPrompt.ai_model}</div>
                                    )}
                                    <div className="similar-stats">
                                        <span>
                                            <HeartIcon isLiked={false} size={16} />
                                            {similarPrompt.likes_count || 0}
                                        </span>
                                        <span>
                                            <BookmarkIcon isSaved={false} size={16} />
                                            {similarPrompt.saves_count || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
