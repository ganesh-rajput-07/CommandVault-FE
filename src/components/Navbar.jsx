import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ unreadCount = 0 }) {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const getAvatarLetters = () => {
        if (!user.username) return 'U?';
        const username = user.username;
        if (username.length === 1) {
            return username.charAt(0).toUpperCase() + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        return (username.charAt(0) + username.charAt(1)).toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/explore" className="navbar-brand">
                    CommandVault
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    ☰
                </button>

                <div className="navbar-right">
                    <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
                        <Link to="/explore" className="nav-link">Explore</Link>
                        <Link to="/trending" className="nav-link">Trending</Link>
                    </div>

                    <div className="navbar-actions">
                        <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <div className="avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getAvatarLetters()}
                                    </div>
                                )}
                                {unreadCount > 0 && <div className="notification-dot"></div>}
                            </div>
                            <span className="username">{user.username}</span>
                        </div>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="dropdown-section">
                                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                                        Profile
                                    </Link>
                                    <Link to="/my-prompts" onClick={() => setShowUserMenu(false)}>
                                        My Prompts
                                    </Link>
                                    <Link to="/profile/saved" onClick={() => setShowUserMenu(false)}>
                                        Saved Prompts
                                    </Link>
                                </div>

                                {unreadCount > 0 && (
                                    <div className="dropdown-section notifications-section">
                                        <div className="section-title">
                                            Notifications ({unreadCount})
                                        </div>
                                        <Link to="/notifications" onClick={() => setShowUserMenu(false)}>
                                            View all notifications
                                        </Link>
                                    </div>
                                )}

                                {unreadCount === 0 && (
                                    <div className="dropdown-section">
                                        <Link to="/notifications" onClick={() => setShowUserMenu(false)}>
                                            Notifications
                                        </Link>
                                    </div>
                                )}

                                <div className="dropdown-section">
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
