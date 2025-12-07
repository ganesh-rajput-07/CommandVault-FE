import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import useNotifications from '../hooks/useNotifications';
import api from '../api';
import './Notifications.css';

export default function Notifications() {
    const { user } = useContext(AuthContext);
    const { unreadCount, markAsRead } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('notifications/');
            setNotifications(res.data.results || res.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.patch(`notifications/${notificationId}/`, { is_read: true });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('notifications/mark_all_read/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ef4444" />
                    </svg>
                );
            case 'comment':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#3b82f6" />
                    </svg>
                );
            case 'follow':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="#8b5cf6" />
                        <circle cx="12" cy="7" r="4" fill="#8b5cf6" />
                    </svg>
                );
            default:
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#a0a0a0" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                );
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <Navbar unreadCount={unreadCount} />
            <div className="notifications-container">
                <div className="notifications-header">
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="rgba(139, 92, 246, 0.2)" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                        <h2>No notifications yet</h2>
                        <p>When you get notifications, they'll show up here</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.notification_type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-text">{notification.content}</p>
                                    <span className="notification-time">
                                        {getTimeAgo(notification.created_at)}
                                    </span>
                                </div>
                                {!notification.is_read && (
                                    <div className="unread-indicator"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
