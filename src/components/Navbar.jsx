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

    const getAvatarLetters = () => {
        if (!user?.username) return 'U';
        const username = user.username;

        // Get first two letters of username
        if (username.length === 1) {
            return username.charAt(0).toUpperCase() + username.charAt(0).toUpperCase();
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
                        <Link to="/explore" className="nav-link" onClick={() => setShowMobileMenu(false)}>Explore</Link>
                        <Link to="/trending" className="nav-link" onClick={() => setShowMobileMenu(false)}>Trending</Link>
                        <Link to="/my-prompts" className="nav-link desktop-nav-link" onClick={() => setShowMobileMenu(false)}>My Prompts</Link>
                        <Link to="/profile" className="nav-link mobile-only" onClick={() => setShowMobileMenu(false)}>Profile</Link>
                        <Link to="/my-prompts" className="nav-link mobile-only" onClick={() => setShowMobileMenu(false)}>My Prompts</Link>
                        <Link to="/saved" className="nav-link mobile-only" onClick={() => setShowMobileMenu(false)}>Saved Prompts</Link>
                        <Link to="/notifications" className="nav-link mobile-only" onClick={() => setShowMobileMenu(false)}>
                            Notifications
                            {unreadCount > 0 && <span className="mobile-notification-badge">{unreadCount}</span>}
                        </Link>
                        <button className="nav-link mobile-only logout-btn" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                            Logout
                        </button>
                    </div>

                    <div className="navbar-actions">
                        {user ? (
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
                            </div>
                        ) : (
                            <div className="user-profile-loading">
                                <div className="avatar">
                                    <div className="avatar-placeholder">...</div>
                                </div>
                            </div>
                        )}

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="dropdown-section">
                                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                                        Profile
                                    </Link>
                                    <Link to="/saved" onClick={() => setShowUserMenu(false)}>
                                        Saved Prompts
                                    </Link>
                                    <Link to="/notifications" onClick={() => setShowUserMenu(false)}>
                                        Notifications
                                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                    </Link>
                                </div>

                                <div className="dropdown-section logout-section">
                                    <button onClick={() => { handleLogout(); setShowUserMenu(false); }}>Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
