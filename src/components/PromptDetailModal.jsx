import { useState } from 'react';
import { HeartIcon, BookmarkIcon, EyeIcon } from './AnimatedIcons';
import './PromptDetailModal.css';

export default function PromptDetailModal({ prompt, onClose, onLike, onSave }) {
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    if (!prompt) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike(prompt.id);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        onSave(prompt.id);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="prompt-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                <div className="modal-header-section">
                    <div className="prompt-owner-info">
                        {prompt.owner?.avatar_url ? (
                            <img src={prompt.owner.avatar_url} alt={prompt.owner.username} className="owner-avatar-large" />
                        ) : (
                            <div className="owner-avatar-large placeholder">
                                {prompt.owner?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3>{prompt.owner?.username}</h3>
                            <p className="upload-date">{new Date(prompt.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {!prompt.is_public && <span className="private-badge">🔒 Private</span>}
                </div>

                <div className="modal-content-section">
                    <h2 className="prompt-title-large">{prompt.title}</h2>

                    {prompt.ai_model && (
                        <div className="model-info">
                            <span className="label">🤖 AI Model:</span>
                            <span>{prompt.ai_model}</span>
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
                            <pre>{prompt.text}</pre>
                        </div>
                    </div>

                    {prompt.example_output && (
                        <div className="example-output-section">
                            <h4>Example Output</h4>
                            <div className="output-box">
                                <pre>{prompt.example_output}</pre>
                            </div>
                        </div>
                    )}

                    {prompt.tags && prompt.tags.length > 0 && (
                        <div className="tags-section">
                            <h4>Tags</h4>
                            <div className="tags-list">
                                {prompt.tags.map((tag, idx) => (
                                    <span key={idx} className="tag-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="action-btn-large" onClick={handleLike}>
                            <HeartIcon isLiked={isLiked} size={20} />
                            <span>{prompt.likes_count || 0} Likes</span>
                        </button>
                        <button className="action-btn-large" onClick={handleSave}>
                            <BookmarkIcon isSaved={isSaved} size={20} />
                            <span>Save</span>
                        </button>
                        <div className="usage-stat">
                            <EyeIcon isViewing={true} size={18} />
                            <span>{prompt.usage_count || 0} uses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
