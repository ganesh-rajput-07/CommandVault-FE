import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, BookmarkIcon, EyeIcon } from './AnimatedIcons';
import UserCard from './UserCard';
import usePrompts from '../hooks/usePrompts';
import './PromptCardEnhanced.css';

export default function PromptCardEnhanced({ prompt, showActions = false, onEdit, onDelete }) {
    const navigate = useNavigate();
    const { toggleLike, toggleSave } = usePrompts();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePromptClick = () => {
        navigate(`/prompt/${prompt.slug}`);
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await toggleLike(prompt.id);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await toggleSave(prompt.id);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderMedia = () => {
        if (prompt.output_image) {
            return (
                <div className="prompt-media image-media">
                    <img
                        src={prompt.output_image}
                        alt={prompt.title}
                        loading="lazy"
                    />
                    <div className="media-overlay">
                        <span className="media-type-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                            Image
                        </span>
                    </div>
                </div>
            );
        }

        if (prompt.output_video) {
            return (
                <div className="prompt-media video-media">
                    <video
                        src={prompt.output_video}
                        poster={prompt.output_image || undefined}
                        preload="metadata"
                    />
                    <div className="media-overlay">
                        <div className="play-button">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <span className="media-type-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                            Video
                        </span>
                    </div>
                </div>
            );
        }

        if (prompt.output_audio) {
            return (
                <div className="prompt-media audio-media">
                    <div className="audio-visualizer">
                        <div className="audio-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                        <div className="waveform">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="wave-bar"
                                    style={{ height: `${Math.random() * 100}%` }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="media-overlay">
                        <span className="media-type-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                            Audio
                        </span>
                    </div>
                </div>
            );
        }

        // No media - show gradient background
        return (
            <div className="prompt-media no-media">
                <div className="gradient-bg"></div>
                {prompt.output_type && (
                    <div className="media-overlay">
                        <span className="media-type-badge">
                            {prompt.output_type === 'code' && (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                                    </svg>
                                    Code
                                </>
                            )}
                            {prompt.output_type === 'text' && (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                    </svg>
                                    Text
                                </>
                            )}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="prompt-card-enhanced" onClick={handlePromptClick}>
            {/* Media Section */}
            {renderMedia()}

            {/* Content Section */}
            <div className="prompt-content">
                {/* Header */}
                <div className="card-header">
                    {prompt.owner && (
                        <UserCard
                            user={prompt.owner}
                            showFollowButton={false}
                            size="small"
                        />
                    )}
                    {!prompt.is_public && (
                        <span className="private-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                            Private
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="card-title">{prompt.title}</h3>

                {/* Description */}
                <p className="card-text">{prompt.text}</p>

                {/* AI Model Badge */}
                {prompt.ai_model && (
                    <div className="model-badge">{prompt.ai_model}</div>
                )}

                {/* Tags */}
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

                {/* Stats */}
                <div className="card-stats">
                    <span
                        className={`stat-item ${isProcessing ? 'processing' : ''}`}
                        onClick={handleLike}
                    >
                        <HeartIcon isLiked={prompt.is_liked_by_user || false} size={20} />
                        <span className="stat-count">{prompt.likes_count || 0}</span>
                    </span>
                    <span
                        className={`stat-item ${isProcessing ? 'processing' : ''}`}
                        onClick={handleSave}
                    >
                        <BookmarkIcon isSaved={prompt.is_saved_by_user || false} size={20} />
                        <span className="stat-count">{prompt.saves_count || 0}</span>
                    </span>
                    <span className="stat-item">
                        <EyeIcon isViewing={prompt.is_viewed_by_user || false} size={20} />
                        <span className="stat-count">{prompt.usage_count || 0}</span>
                    </span>
                </div>

                {/* Action Buttons (for MyPrompts page) */}
                {showActions && (
                    <div className="card-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit && onEdit(prompt);
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete(prompt);
                            }}
                            title="Delete prompt"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
