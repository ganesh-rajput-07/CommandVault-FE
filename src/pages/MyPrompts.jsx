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

export default function MyPrompts() {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({
        title: "",
        text: "",
        ai_model: "",
        example_output: "",
        tags: "",
        is_public: true,
    });

    const loadMyPrompts = async () => {
        setLoading(true);
        try {
            const res = await api.get('prompts/mine/');
            setPrompts(res.data.results || res.data);
        } catch (error) {
            console.error('Error loading my prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPrompt = async (e) => {
        e.preventDefault();
        if (!form.title || !form.text) return;

        try {
            const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            await api.post("prompts/", { ...form, tags: tagsArray });
            setForm({ title: "", text: "", ai_model: "", example_output: "", tags: "", is_public: true });
            setShowCreateModal(false);
            loadMyPrompts();
        } catch (error) {
            console.error('Error creating prompt:', error);
            alert('Failed to create prompt');
        }
    };

    const handlePromptClick = (promptSlug) => {
        navigate(`/prompt/${promptSlug}`);
    };

    useEffect(() => {
        loadMyPrompts();
    }, []);

    return (
        <>
            <SEO title="My Prompts" description="Manage your AI prompts" />
            <Navbar unreadCount={unreadCount} />

            <div className="dashboard-container">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-background"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">
                            My <span className="gradient-text">Prompts</span>
                        </h1>
                        <p className="hero-subtitle">
                            Create, manage, and share your AI prompts
                        </p>
                        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create New Prompt
                        </button>
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
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3>No prompts yet</h3>
                                <p>Start creating your first AI prompt to build your collection</p>
                                <button className="btn-clear-filters" onClick={() => setShowCreateModal(true)}>
                                    Create Your First Prompt
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
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt={user.username} className="avatar-sm" />
                                                ) : (
                                                    <div className="avatar-sm placeholder">
                                                        {user?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="owner-name">{user?.username}</span>
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
                </div>
            </div>

            {/* Create Prompt Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Prompt</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={createPrompt} className="modal-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    placeholder="Enter a descriptive title..."
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Prompt Content *</label>
                                <textarea
                                    placeholder="Write your prompt here..."
                                    value={form.text}
                                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                                    required
                                    rows="6"
                                />
                            </div>

                            <div className="form-group">
                                <label>AI Model/Tool</label>
                                <input
                                    type="text"
                                    placeholder="e.g., ChatGPT-4, Claude, Gemini"
                                    value={form.ai_model}
                                    onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Example Output (Optional)</label>
                                <textarea
                                    placeholder="Paste an example of what this prompt generates..."
                                    value={form.example_output}
                                    onChange={(e) => setForm({ ...form, example_output: e.target.value })}
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <input
                                    type="text"
                                    placeholder="coding, creative, business (comma separated)"
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                />
                            </div>

                            <div className="form-group-checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.is_public}
                                        onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                                    />
                                    <span className="checkbox-text">
                                        <strong>Make this prompt public</strong>
                                        <small>Allow others to discover and use your prompt</small>
                                    </span>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Prompt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
