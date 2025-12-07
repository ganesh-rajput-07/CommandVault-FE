import { useEffect, useState, useContext } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptDetailModal from "../components/PromptDetailModal";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import "../pages/Dashboard.css";

export default function MyPrompts() {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
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

    const handlePromptClick = (prompt) => {
        setSelectedPrompt(prompt);
        setShowDetailModal(true);
    };

    const handleLike = async (promptId) => {
        try {
            await api.post('likes/toggle/', { prompt_id: promptId });
            loadMyPrompts();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleSave = async (promptId) => {
        try {
            await api.post('saved/toggle/', { prompt_id: promptId });
            alert('Prompt saved!');
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    useEffect(() => {
        loadMyPrompts();
    }, []);

    return (
        <>
            <SEO title="My Prompts" description="Manage your AI prompts" />
            <Navbar unreadCount={unreadCount} />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>My Prompts</h1>
                    <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                        + Add Prompt
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="prompts-grid">
                        {prompts.length === 0 ? (
                            <div className="empty-state">
                                <p>You haven't created any prompts yet. Click "+ Add Prompt" to get started!</p>
                            </div>
                        ) : (
                            prompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="prompt-grid-card"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    <div className="card-header">
                                        <div className="owner-info">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="avatar-sm" />
                                            ) : (
                                                <div className="avatar-sm placeholder">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="owner-name">{user.username}</span>
                                        </div>
                                        {!prompt.is_public && <span className="private-icon">🔒</span>}
                                    </div>

                                    <h3 className="card-title">{prompt.title}</h3>
                                    <p className="card-text">{prompt.text.substring(0, 150)}...</p>

                                    {prompt.ai_model && (
                                        <div className="model-badge">{prompt.ai_model}</div>
                                    )}

                                    {prompt.tags && prompt.tags.length > 0 && (
                                        <div className="card-tags">
                                            {prompt.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="tag-sm">{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card-stats">
                                        <span>❤️ {prompt.likes_count || 0}</span>
                                        <span>💾 {prompt.saves_count || 0}</span>
                                        <span>👁️ {prompt.usage_count || 0}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Prompt Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Prompt</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={createPrompt} className="create-form">
                            <input
                                placeholder="Title *"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />

                            <textarea
                                placeholder="Write your prompt... *"
                                value={form.text}
                                onChange={(e) => setForm({ ...form, text: e.target.value })}
                                required
                                rows="4"
                            />

                            <input
                                placeholder="AI Model/Tool (e.g., ChatGPT-4, Claude, Gemini)"
                                value={form.ai_model}
                                onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
                            />

                            <textarea
                                placeholder="Example output (optional)"
                                value={form.example_output}
                                onChange={(e) => setForm({ ...form, example_output: e.target.value })}
                                rows="3"
                            />

                            <input
                                placeholder="Tags (comma separated)"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            />

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.is_public}
                                    onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                                />
                                <span>Make this prompt public</span>
                            </label>

                            <button type="submit">Post Prompt</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Prompt Detail Modal */}
            {showDetailModal && selectedPrompt && (
                <PromptDetailModal
                    prompt={selectedPrompt}
                    onClose={() => setShowDetailModal(false)}
                    onLike={handleLike}
                    onSave={handleSave}
                />
            )}
        </>
    );
}
