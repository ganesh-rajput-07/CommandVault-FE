import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { QRCodeSVG } from "qrcode.react";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import UserCard from "../components/UserCard";
import MediaViewer from "../components/MediaViewer";
import PromptCardEnhanced from "../components/PromptCardEnhanced";
import { HeartIcon, BookmarkIcon, EyeIcon } from "../components/AnimatedIcons";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import usePrompts from "../hooks/usePrompts";
import "./PromptDetail.css";

// Share Modal Component
import ShareModal from "../components/ShareModal";

export default function PromptDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { unreadCount } = useNotifications();

    // States
    const [localPrompt, setLocalPrompt] = useState(null);
    const { prompts, toggleLike, toggleSave, updatePrompt } = usePrompts();
    const [similarPrompts, setSimilarPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [showLargeHeart, setShowLargeHeart] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    // New Feature States
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isForking, setIsForking] = useState(false);
    const [unlocking, setUnlocking] = useState(false);

    // Intersection Observer for Scroll Unlock
    const { ref: scrollRef, inView } = useInView({
        threshold: 1.0,
        triggerOnce: true,
    });

    // Sync with global state
    const prompt = prompts.find(p => p.slug === slug) || localPrompt;

    useEffect(() => {
        loadPrompt();
        loadSimilarPrompts();
    }, [slug]);

    useEffect(() => {
        // Auto unlock on scroll
        if (inView && prompt?.is_locked && !unlocking) {
            handleUnlock('scroll');
        }
    }, [inView]);

    const loadPrompt = async () => {
        try {
            const res = await api.get(`prompts/${slug}/`);
            const loadedPrompt = res.data;
            setLocalPrompt(loadedPrompt);
            updatePrompt(loadedPrompt.id, loadedPrompt);

            // Record view
            try {
                await api.post(`prompts/${slug}/record_view/`);
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
            const res = await api.get(`prompts/${slug}/similar/`);
            setSimilarPrompts(res.data.slice(0, 6)); // Show max 6 similar prompts
        } catch (error) {
            console.error('Error loading similar prompts:', error);
        }
    };

    const handleCopy = () => {
        if (prompt && !prompt.is_locked) {
            navigator.clipboard.writeText(prompt.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFork = async () => {
        if (!prompt || isForking) return;
        setIsForking(true);
        try {
            const res = await api.post(`prompts/${slug}/fork/`);
            const newSlug = res.data.slug;
            navigate(`/prompt/${newSlug}`); // Redirect to new fork
            // Ideally should redirect to edit mode or something, but detail is fine
        } catch (error) {
            console.error("Error forking prompt:", error);
            alert("Failed to fork prompt. Make sure it is unlocked.");
        } finally {
            setIsForking(false);
        }
    };

    const handleUnlock = async (method = 'scroll') => {
        if (!prompt || unlocking) return;
        setUnlocking(true);
        try {
            await api.post(`prompts/${slug}/unlock/`, { method });
            // Refresh prompt to get full content
            await loadPrompt();
        } catch (error) {
            console.error("Error unlocking:", error);
        } finally {
            setUnlocking(false);
        }
    };

    const handleShare = async () => {
        if (!prompt) return;
        try {
            const res = await api.get(`prompts/${slug}/share_token/`);
            setShareUrl(res.data.share_url);
            setShareModalOpen(true);
        } catch (error) {
            console.error("Error generating share token:", error);
        }
    };

    const handleMediaClick = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            if (prompt && !prompt.is_liked_by_user) {
                handleLike();
                setShowLargeHeart(true);
                setTimeout(() => setShowLargeHeart(false), 1000);
            }
        } else {
            if (prompt.output_image || prompt.output_video) {
                setShowViewer(true);
            }
        }
        setLastTap(now);
    };

    const handleLike = async () => {
        if (!prompt) return;
        try {
            await toggleLike(prompt.id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleSave = async () => {
        if (!prompt) return;
        try {
            await toggleSave(prompt.id);
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span className="upload-date">
                                {new Date(prompt.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {prompt.parent_prompt_slug && (
                                <span className="fork-badge" style={{ fontSize: '0.8rem', color: '#888' }}>
                                    Forked from <strong onClick={() => navigate(`/prompt/${prompt.parent_prompt_slug}`)} style={{ cursor: 'pointer', color: '#8b5cf6' }}>@{prompt.original_creator_username || 'original'}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="detail-title">{prompt.title}</h1>

                    {/* AI Model Badge */}
                    {prompt.ai_model && (
                        <div className="detail-model-badge">
                            {Array.isArray(prompt.ai_model) ? prompt.ai_model.join(', ') : prompt.ai_model}
                        </div>
                    )}

                    {/* Prompt Content */}
                    <div className="prompt-content-section">
                        <div className="section-header">
                            <h3>Prompt</h3>
                            <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={handleCopy} disabled={prompt.is_locked}>
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
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"></path>
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

                    {/* Media Output */}
                    {(prompt.output_image || prompt.output_video || prompt.output_audio) && (
                        <div className="media-output-section">
                            <div className="section-header">
                                <h3>Example Output</h3>
                                {(prompt.output_image || prompt.output_video) && (
                                    <div className="view-tip">Single tap to view fullscreen • Double tap to Like</div>
                                )}
                            </div>

                            <div className="media-detail-viewer" onClick={handleMediaClick}>
                                {prompt.output_image && (
                                    <div className="output-image-container">
                                        <img src={prompt.output_image} alt="Example output" className="output-image" />
                                    </div>
                                )}
                                {prompt.output_video && (
                                    <div className="output-video-container">
                                        <video className="output-video" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()}>
                                            <source src={prompt.output_video} type="video/mp4" />
                                        </video>
                                    </div>
                                )}

                                {showLargeHeart && (
                                    <div className="large-heart-overlay">
                                        <HeartIcon isLiked={true} size={120} />
                                    </div>
                                )}
                            </div>

                            {prompt.output_audio && (
                                <div className="output-audio-container">
                                    <div className="audio-player">
                                        <div className="audio-info">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 18V5l12-2v13"></path>
                                                <circle cx="6" cy="18" r="3"></circle>
                                                <circle cx="18" cy="16" r="3"></circle>
                                            </svg>
                                            <span>Audio Output</span>
                                        </div>
                                        <audio controls className="output-audio">
                                            <source src={prompt.output_audio} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Example Output */}
                    {prompt.example_output && (
                        <div className="example-output-section">
                            <div className="section-header">
                                <h3>Text Output</h3>
                                <button className="view-btn-small" onClick={() => setShowViewer(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                    Fullscreen
                                </button>
                            </div>
                            <div className="example-output-box" onClick={() => setShowViewer(true)}>
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

                        {/* Fork Button */}
                        <button
                            className="action-btn"
                            onClick={handleFork}
                            disabled={prompt.is_locked || isForking}
                            style={prompt.is_locked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 3v12" />
                                <circle cx="6" cy="18" r="3" />
                                <path d="M18 9a9 9 0 0 1-9 9" />
                            </svg>
                            <span>{isForking ? 'Forking...' : 'Fork'}</span>
                        </button>

                        {/* Share Button */}
                        <button className="action-btn" onClick={handleShare}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Similar Prompts Section */}
                {similarPrompts.length > 0 && (
                    <div className="similar-prompts-section">
                        <h2>Similar Prompts</h2>
                        <div className="similar-prompts-grid">
                            {similarPrompts.map((similarPrompt) => (
                                <PromptCardEnhanced key={similarPrompt.id} prompt={similarPrompt} />
                            ))}
                        </div>
                    </div>
                )}
            </div >

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
                prompt={prompt}
            />
        </>
    );
}
