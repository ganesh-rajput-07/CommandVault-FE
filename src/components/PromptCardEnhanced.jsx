import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, BookmarkIcon, EyeIcon } from './AnimatedIcons';
import UserCard from './UserCard';
import MediaViewer from './MediaViewer';
import usePrompts from '../hooks/usePrompts';
import ShareModal from './ShareModal';
import api from '../api';
import './PromptCardEnhanced.css';

export default function PromptCardEnhanced({ prompt: initialPrompt, showActions = false, onEdit, onDelete }) {
    const navigate = useNavigate();
    const { toggleLike, toggleSave, prompts } = usePrompts();
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [showLargeHeart, setShowLargeHeart] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    // Get the most up-to-date version of this prompt from global state
    const prompt = prompts.find(p => p.id === initialPrompt.id) || initialPrompt;

    const handlePromptClick = () => {
        navigate(`/prompt/${prompt.slug}`);
    };

    const handleDoubleTap = () => {
        if (!prompt.is_liked_by_user) {
            toggleLike(prompt.id);
            setShowLargeHeart(true);
            setTimeout(() => setShowLargeHeart(false), 1000);
        }
    };

    const handleLike = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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

    const handleShare = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        try {
            const res = await api.get(`prompts/${prompt.slug}/share_token/`);
            setShareUrl(res.data.share_url);
            setShareModalOpen(true);
        } catch (error) {
            console.error("Error generating share token:", error);
        }
    };

    const renderMedia = () => {
        const outputType = prompt.output_type || 'text';
        const config = {
            text: { icon: '📄', label: 'Text', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
            code: { icon: '💻', label: 'Code', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' },
            image: { icon: '🖼️', label: 'Image', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
            video: { icon: '🎥', label: 'Video', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ef4444 100%)' },
            audio: { icon: '🎵', label: 'Audio', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }
        }[outputType] || { icon: '📄', label: 'Text', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' };

        const hasActualMedia = prompt.output_image || prompt.output_video;
        const hasTextOutput = prompt.example_output && (outputType === 'code' || outputType === 'text');
        const canViewDetail = hasActualMedia || hasTextOutput;

        const handleMediaClick = (e) => {
            e.stopPropagation();
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;

            if (now - lastTap < DOUBLE_TAP_DELAY) {
                // Double tap detected
                handleDoubleTap();
            } else {
                // If single tap and has viewable content, show viewer
                if (canViewDetail) {
                    setShowViewer(true);
                }
            }
            setLastTap(now);
        };

        return (
            <div
                className={`prompt-media ${hasActualMedia ? 'actual-media' : 'category-media'}`}
                style={!hasActualMedia ? { background: config.gradient } : {}}
                onClick={handleMediaClick}
            >
                {prompt.output_image && (
                    <img src={prompt.output_image} alt={prompt.title} className="media-preview" />
                )}
                {prompt.output_video && !prompt.output_image && (
                    <video
                        src={prompt.output_video}
                        className="media-preview"
                        muted
                        loop
                        playsInline
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => e.target.pause()}
                    />
                )}

                {!hasActualMedia && (
                    <div className="category-icon-overlay">
                        {config.icon}
                    </div>
                )}

                {showLargeHeart && (
                    <div className="large-heart-overlay">
                        <HeartIcon isLiked={true} size={80} />
                    </div>
                )}
                <div className="media-overlay">
                    <span className="media-type-badge">
                        {config.icon} {config.label}
                    </span>
                    {canViewDetail && (
                        <div className="view-indicator">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            </svg>
                        </div>
                    )}
                </div>
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
                    <div className="model-badge">
                        {Array.isArray(prompt.ai_model) ? prompt.ai_model.join(', ') : prompt.ai_model}
                    </div>
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

                <div className="card-stats">
                    <div className={`stat-item heart-btn ${isProcessing ? 'processing' : ''}`}>
                        <HeartIcon
                            isLiked={prompt.is_liked_by_user || false}
                            onClick={handleLike}
                            size={22}
                        />
                        <span className="stat-count">{prompt.likes_count || 0}</span>
                    </div>
                    <div className={`stat-item bookmark-btn ${isProcessing ? 'processing' : ''}`}>
                        <BookmarkIcon
                            isSaved={prompt.is_saved_by_user || false}
                            onClick={handleSave}
                            size={22}
                        />
                        <span className="stat-count">{prompt.saves_count || 0}</span>
                    </div>
                    <div className="stat-item eye-btn">
                        <EyeIcon isViewing={prompt.is_viewed_by_user || false} size={22} />
                        <span className="stat-count">{prompt.usage_count || 0}</span>
                    </div>
                    <div className="stat-item share-btn" onClick={handleShare}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </div>
                </div>
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


            {/* Fullscreen Media Viewer */}
            {
                showViewer && (
                    <MediaViewer
                        media={prompt.output_image || prompt.output_video}
                        type={prompt.output_type}
                        title={prompt.title}
                        text={prompt.example_output}
                        onClose={() => setShowViewer(false)}
                    />
                )
            }

            {/* Share Modal */}
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                shareUrl={shareUrl}
            />
        </div >
    );
}
