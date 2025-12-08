import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { HeartIcon, BookmarkIcon, EyeIcon } from "../components/AnimatedIcons";
import useNotifications from "../hooks/useNotifications";
import useFollow from "../hooks/useFollow";
import "./UserProfile.css";

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { followUser, unfollowUser, loading: followLoading } = useFollow();

    const [user, setUser] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, [username]);

    const loadUserProfile = async () => {
        try {
            const res = await api.get(`auth/users/${username}/profile/`);
            setUser(res.data);
            setIsFollowing(res.data.is_following || false);
            // Load prompts after getting user data
            loadUserPrompts(res.data.id);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserPrompts = async (userId) => {
        try {
            const res = await api.get(`prompts/?owner_id=${userId}`);
            setPrompts(res.data.results || res.data);
        } catch (error) {
            console.error('Error loading user prompts:', error);
        }
    };

    const handleFollow = async () => {
        if (!user) return;
        try {
            if (isFollowing) {
                await unfollowUser(user.id);
                setIsFollowing(false);
                setUser(prev => ({ ...prev, follower_count: (prev.follower_count || 1) - 1 }));
            } else {
                await followUser(user.id);
                setIsFollowing(true);
                setUser(prev => ({ ...prev, follower_count: (prev.follower_count || 0) + 1 }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const getAvatarLetters = () => {
        if (!user?.username) return 'U';
        const words = user.username.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return user.username.substring(0, 2).toUpperCase();
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

    if (!user) {
        return (
            <>
                <Navbar unreadCount={unreadCount} />
                <div className="error-container">
                    <h2>User not found</h2>
                    <button onClick={() => navigate('/explore')} className="btn-back">
                        Back to Explore
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar unreadCount={unreadCount} />

            <div className="user-profile-container">
                {/* Banner */}
                <div className="profile-banner">
                    {user.banner ? (
                        <img src={user.banner} alt="Banner" className="banner-image" />
                    ) : (
                        <div className="banner-gradient"></div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="profile-info-section">
                    <div className="profile-avatar-container">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="profile-avatar-large" />
                        ) : (
                            <div className="profile-avatar-large placeholder">
                                {getAvatarLetters()}
                            </div>
                        )}
                    </div>

                    <div className="profile-details">
                        <div className="profile-header">
                            <div>
                                <h1 className="profile-username">{user.username}</h1>
                                <p className="profile-email">{user.email}</p>
                            </div>
                            <button
                                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                                onClick={handleFollow}
                                disabled={followLoading}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>

                        {user.bio && (
                            <p className="profile-bio">{user.bio}</p>
                        )}

                        <div className="profile-stats">
                            <div className="stat-box">
                                <span className="stat-number">{prompts.length}</span>
                                <span className="stat-label">Prompts</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">{user.follower_count || 0}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">{user.following_count || 0}</span>
                                <span className="stat-label">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Prompts */}
                <div className="user-prompts-section">
                    <h2>Prompts by {user.username}</h2>

                    {prompts.length === 0 ? (
                        <div className="empty-state">
                            <p>No public prompts yet</p>
                        </div>
                    ) : (
                        <div className="prompts-grid">
                            {prompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="prompt-card"
                                    onClick={() => navigate(`/prompt/${prompt.slug}`)}
                                >
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
                                            <HeartIcon isLiked={false} size={20} />
                                            <span className="stat-count">{prompt.likes_count || 0}</span>
                                        </span>
                                        <span className="stat-item">
                                            <BookmarkIcon isSaved={false} size={20} />
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
        </>
    );
}
