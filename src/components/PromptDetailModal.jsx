import { useState } from 'react';
import './PromptDetailModal.css';

export default function PromptDetailModal({ prompt, isOpen, onClose, onLike, onSave }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !prompt) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="prompt-detail-modal glass" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className="modal-header-section">
                    <div className="prompt-owner-info">
                        {prompt.owner.avatar_url ? (
                            <img src={prompt.owner.avatar_url} alt={prompt.owner.username} className="owner-avatar-large" />
                        ) : (
                            <div className="owner-avatar-large placeholder">
                                {prompt.owner.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3>{prompt.owner.username}</h3>
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
                            <span className="tag">{prompt.ai_model}</span>
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
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="action-btn-large" onClick={() => onLike(prompt.id)}>
                            ❤️ {prompt.like_count} Likes
                        </button>
                        <button className="action-btn-large" onClick={() => onSave(prompt.id)}>
                            🔖 Save
                        </button>
                        <button className="action-btn-large">
                            💬 {prompt.comment_count} Comments
                        </button>
                        <div className="usage-stat">
                            👁️ {prompt.times_used} uses
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
