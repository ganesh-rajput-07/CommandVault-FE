import { useState, useEffect } from 'react';
import { HeartIcon, BookmarkIcon, EyeIcon } from './AnimatedIcons';
import api from '../api';
import './PromptDetailModal.css';

export default function PromptDetailModal({ prompt, onClose, onLike, onSave }) {
    const [copied, setCopied] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState(prompt);
    const [isLiked, setIsLiked] = useState(prompt.is_liked_by_user || false);
    const [isSaved, setIsSaved] = useState(prompt.is_saved_by_user || false);

    // Update state when prompt prop changes
    useEffect(() => {
        setCurrentPrompt(prompt);
        setIsLiked(prompt.is_liked_by_user || false);
        setIsSaved(prompt.is_saved_by_user || false);
    }, [prompt]);

    if (!currentPrompt) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentPrompt.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLike = async () => {
        try {
            // Toggle local state immediately
            setIsLiked(!isLiked);

            // Update count immediately
            setCurrentPrompt(prev => ({
                ...prev,
                likes_count: isLiked ? (prev.likes_count || 1) - 1 : (prev.likes_count || 0) + 1
            }));

            // Call API
            await api.post('likes/toggle/', { prompt_id: currentPrompt.id });

            // Fetch fresh data
            const res = await api.get(`prompts/${currentPrompt.id}/`);
            setCurrentPrompt(res.data);
            setIsLiked(res.data.is_liked_by_user || false);

            // Notify parent to update list
            if (onLike) onLike(currentPrompt.id);
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(!isLiked);
        }
    };

    const handleSave = async () => {
        try {
            // Toggle local state immediately
            setIsSaved(!isSaved);

            // Update count immediately
            setCurrentPrompt(prev => ({
                ...prev,
                saves_count: isSaved ? (prev.saves_count || 1) - 1 : (prev.saves_count || 0) + 1
            }));

            // Call API
            await api.post('saved/toggle/', { prompt_id: currentPrompt.id });

            // Fetch fresh data
            const res = await api.get(`prompts/${currentPrompt.id}/`);
            setCurrentPrompt(res.data);
            setIsSaved(res.data.is_saved_by_user || false);

            // Notify parent to update list
            if (onSave) onSave(currentPrompt.id);
        } catch (error) {
            console.error('Error toggling save:', error);
            // Revert on error
            setIsSaved(!isSaved);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="prompt-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                <div className="modal-header-section">
                    <div className="prompt-owner-info">
                        {currentPrompt.owner?.avatar_url ? (
                            <img src={currentPrompt.owner.avatar_url} alt={currentPrompt.owner.username} className="owner-avatar-large" />
                        ) : (
                            <div className="owner-avatar-large placeholder">
                                {currentPrompt.owner?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3>{currentPrompt.owner?.username}</h3>
                            <p className="upload-date">{new Date(currentPrompt.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {!currentPrompt.is_public && <span className="private-badge">🔒 Private</span>}
                </div>

                <div className="modal-content-section">
                    <h2 className="prompt-title-large">{currentPrompt.title}</h2>

                    {currentPrompt.ai_model && (
                        <div className="model-info">
                            <span className="label">🤖 AI Model:</span>
                            <span>{currentPrompt.ai_model}</span>
                        </div>
                    )}

                    <div className="prompt-text-section">
                        <div className="section-header">
                            <h4>Prompt</h4>
                            <button className="copy-btn" onClick={handleCopy}>
                                {copied ? '✅ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                        <div className="prompt-text-box">
                            <pre>{currentPrompt.text}</pre>
                        </div>
                    </div>

                    {currentPrompt.example_output && (
                        <div className="example-output-section">
                            <h4>Example Output</h4>
                            <div className="output-box">
                                <pre>{currentPrompt.example_output}</pre>
                            </div>
                        </div>
                    )}

                    {currentPrompt.tags && currentPrompt.tags.length > 0 && (
                        <div className="tags-section">
                            <h4>Tags</h4>
                            <div className="tags-list">
                                {currentPrompt.tags.map((tag, idx) => (
                                    <span key={idx} className="tag-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="action-btn-large" onClick={handleLike}>
                            <HeartIcon isLiked={isLiked} size={20} />
                            <span>{currentPrompt.likes_count || 0} Likes</span>
                        </button>
                        <button className="action-btn-large" onClick={handleSave}>
                            <BookmarkIcon isSaved={isSaved} size={20} />
                            <span>Save</span>
                        </button>
                        <div className="usage-stat">
                            <EyeIcon isViewing={true} size={18} />
                            <span>{currentPrompt.usage_count || 0} uses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
