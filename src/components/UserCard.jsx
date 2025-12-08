import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import useFollow from '../hooks/useFollow';
import './UserCard.css';

export default function UserCard({ user, showFollowButton = true, size = 'small' }) {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const { followUser, unfollowUser, loading } = useFollow();
    const [isFollowing, setIsFollowing] = useState(user?.is_following || false);
    const [followerCount, setFollowerCount] = useState(user?.follower_count || 0);

    const getAvatarLetters = () => {
        if (!user?.username) return 'U';
        const username = user.username;
        if (username.length === 1) {
            return username.charAt(0).toUpperCase() + username.charAt(0).toUpperCase();
        }
        return (username.charAt(0) + username.charAt(1)).toUpperCase();
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (loading) return;

        if (isFollowing) {
            const success = await unfollowUser(user.id);
            if (success) {
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
            }
        } else {
            const success = await followUser(user.id);
            if (success) {
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        }
    };

    const handleUserClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${user.id}`);
    };

    const isOwnProfile = currentUser?.id === user?.id;

    return (
        <div className={`user-card user-card-${size}`}>
            <div className="user-card-avatar" onClick={handleUserClick}>
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                ) : (
                    <div className="user-card-avatar-placeholder">
                        {getAvatarLetters()}
                    </div>
                )}
            </div>
            <div className="user-card-info">
                <span className="user-card-username" onClick={handleUserClick}>
                    {user?.username}
                </span>
                {size !== 'tiny' && (
                    <span className="user-card-followers">
                        {followerCount.toLocaleString()} {followerCount === 1 ? 'follower' : 'followers'}
                    </span>
                )}
            </div>
            {showFollowButton && !isOwnProfile && (
                <button
                    className={`user-card-follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                    disabled={loading}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );
}
