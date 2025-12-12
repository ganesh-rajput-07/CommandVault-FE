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
import "./MyPrompts.css";

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
        output_type: "text",
    });
    const [outputFile, setOutputFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [promptToDelete, setPromptToDelete] = useState(null);

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
            const formData = new FormData();
            const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

            // Add text fields
            formData.append('title', form.title);
            formData.append('text', form.text);
            formData.append('ai_model', form.ai_model);
            formData.append('example_output', form.example_output);
            formData.append('tags', JSON.stringify(tagsArray));
            formData.append('is_public', form.is_public);
            formData.append('output_type', form.output_type);

            // Add file if present
            if (outputFile) {
                const fieldName = form.output_type === 'image' ? 'output_image' :
                    form.output_type === 'video' ? 'output_video' :
                        form.output_type === 'audio' ? 'output_audio' : null;
                if (fieldName) {
                    formData.append(fieldName, outputFile);
                }
            }

            await api.post("prompts/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setForm({ title: "", text: "", ai_model: "", example_output: "", tags: "", is_public: true, output_type: "text" });
            setOutputFile(null);
            setFilePreview(null);
            setShowCreateModal(false);
            loadMyPrompts();
        } catch (error) {
            console.error('Error creating prompt:', error);
            alert('Failed to create prompt');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOutputFile(file);

            // Create preview for images
            if (form.output_type === 'image') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(file.name);
            }
        }
    };

    const handlePromptClick = (promptSlug) => {
        navigate(`/prompt/${promptSlug}`);
    };

    const handleEdit = (e, prompt) => {
        e.stopPropagation();
        setEditingPrompt(prompt);
        setForm({
            title: prompt.title,
            text: prompt.text,
            ai_model: prompt.ai_model || '',
            example_output: prompt.example_output || '',
            tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
            is_public: prompt.is_public,
            output_type: prompt.output_type || 'text',
        });
        setShowEditModal(true);
    };

    const handleDelete = (e, prompt) => {
        e.stopPropagation();
        setPromptToDelete(prompt);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!promptToDelete) return;

        try {
            await api.delete(`prompts/${promptToDelete.slug}/`);
            setPrompts(prev => prev.filter(p => p.id !== promptToDelete.id));
            setShowDeleteModal(false);
            setPromptToDelete(null);
        } catch (error) {
            console.error('Error deleting prompt:', error);
            alert('Failed to delete prompt');
        }
    };

    const updatePrompt = async (e) => {
        e.preventDefault();
        if (!form.title || !form.text || !editingPrompt) return;

        try {
            const formData = new FormData();
            const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

            formData.append('title', form.title);
            formData.append('text', form.text);
            formData.append('ai_model', form.ai_model);
            formData.append('example_output', form.example_output);
            formData.append('tags', JSON.stringify(tagsArray));
            formData.append('is_public', form.is_public);
            formData.append('output_type', form.output_type);

            if (outputFile) {
                const fieldName = form.output_type === 'image' ? 'output_image' :
                    form.output_type === 'video' ? 'output_video' :
                        form.output_type === 'audio' ? 'output_audio' : null;
                if (fieldName) {
                    formData.append(fieldName, outputFile);
                }
            }

            const res = await api.patch(`prompts/${editingPrompt.slug}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? res.data : p));
            setForm({ title: "", text: "", ai_model: "", example_output: "", tags: "", is_public: true, output_type: "text" });
            setOutputFile(null);
            setFilePreview(null);
            setShowEditModal(false);
            setEditingPrompt(null);
        } catch (error) {
            console.error('Error updating prompt:', error);
            alert('Failed to update prompt');
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
                        <button className="btn-create" onClick={() => navigate('/create-prompt')}>
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
                                <button className="btn-clear-filters" onClick={() => navigate('/create-prompt')}>
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

                                        <div className="card-actions">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={(e) => handleEdit(e, prompt)}
                                                title="Edit prompt"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={(e) => handleDelete(e, prompt)}
                                                title="Delete prompt"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
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
                                <label>Output Type</label>
                                <select
                                    value={form.output_type}
                                    onChange={(e) => {
                                        setForm({ ...form, output_type: e.target.value });
                                        setOutputFile(null);
                                        setFilePreview(null);
                                    }}
                                    className="output-type-select"
                                >
                                    <option value="text">Text Output</option>
                                    <option value="image">Image Output</option>
                                    <option value="video">Video Output</option>
                                    <option value="audio">Audio/Music Output</option>
                                    <option value="code">Code Output</option>
                                </select>
                            </div>

                            {form.output_type !== 'text' && form.output_type !== 'code' && (
                                <div className="form-group">
                                    <label>Upload Example Output</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            id="output-file"
                                            accept={
                                                form.output_type === 'image' ? 'image/*' :
                                                    form.output_type === 'video' ? 'video/*' :
                                                        form.output_type === 'audio' ? 'audio/*' : '*'
                                            }
                                            onChange={handleFileChange}
                                            className="file-input"
                                        />
                                        <label htmlFor="output-file" className="file-upload-label">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            {outputFile ? 'Change File' : `Upload ${form.output_type}`}
                                        </label>
                                        {filePreview && (
                                            <div className="file-preview">
                                                {form.output_type === 'image' ? (
                                                    <img src={filePreview} alt="Preview" className="preview-image" />
                                                ) : (
                                                    <div className="file-name">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                            <polyline points="13 2 13 9 20 9"></polyline>
                                                        </svg>
                                                        {filePreview}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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

            {/* Edit Prompt Modal */}
            {showEditModal && (
                <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Prompt</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={updatePrompt} className="modal-form">
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
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Prompt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Prompt</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body delete-confirmation">
                            <svg className="warning-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <h3>Are you sure?</h3>
                            <p>
                                This will permanently delete "<strong>{promptToDelete?.title}</strong>".
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-danger" onClick={confirmDelete}>
                                Delete Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
