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

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    CommandVault
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    ☰
                </button>

                <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
                    <Link to="/" className="nav-link">Explore</Link>
                    <Link to="/trending" className="nav-link">Trending</Link>
                </div>

                <div className="navbar-actions">
                    <div className="user-menu">
                        <button
                            className="user-avatar-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className={`user-avatar ${unreadCount > 0 ? 'has-notification' : ''}`}>
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {unreadCount > 0 && <span className="notification-dot"></span>}
                            </div>
                            <span className="username-display">{user.username}</span>
                        </button>

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
