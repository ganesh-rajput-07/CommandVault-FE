import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import useNotifications from '../hooks/useNotifications';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalLikes: 0,
    totalSaves: 0,
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const promptsRes = await api.get('prompts/mine/');
      const prompts = promptsRes.data.results || promptsRes.data;

      const totalLikes = prompts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalSaves = prompts.reduce((sum, p) => sum + (p.saves_count || 0), 0);

      setStats({
        totalPrompts: prompts.length,
        totalLikes,
        totalSaves,
        followers: 0,
        following: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      await api.patch('auth/user/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const getAvatarLetters = () => {
    if (!user?.username) return 'U?';
    const username = user.username;
    if (username.length === 1) {
      return username.charAt(0).toUpperCase() + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return (username.charAt(0) + username.charAt(1)).toUpperCase();
  };

  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {editMode ? (
              <div className="avatar-upload-wrapper">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" className="avatar-upload-label">
                  {avatarPreview || user?.avatar_url ? (
                    <img src={avatarPreview || user.avatar_url} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {getAvatarLetters()}
                    </div>
                  )}
                  <div className="avatar-upload-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Change Photo</span>
                  </div>
                </label>
              </div>
            ) : (
              <>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {getAvatarLetters()}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="profile-info">
            <h1>{user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-joined">
              Joined {new Date(user?.date_joined).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <button
            className="btn-edit-profile"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editMode && (
          <div className="edit-profile-section">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>
            <button className="btn-save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalPrompts}</div>
            <div className="stat-label">Prompts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalSaves}</div>
            <div className="stat-label">Total Saves</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.followers}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.following}</div>
            <div className="stat-label">Following</div>
          </div>
        </div>

        {user?.bio && !editMode && (
          <div className="profile-bio">
            <h2>Bio</h2>
            <p>{user.bio}</p>
          </div>
        )}
      </div>
    </>
  );
}
