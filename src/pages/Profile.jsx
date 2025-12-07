import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import useNotifications from '../hooks/useNotifications';
import api from '../api';
import { HeartIcon, BookmarkIcon, EyeIcon } from '../components/AnimatedIcons';
import PromptDetailModal from '../components/PromptDetailModal';
import './Profile.css';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('prompts');
  const [prompts, setPrompts] = useState([]);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalLikes: 0,
    totalSaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizeTab, setCustomizeTab] = useState('branding');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    loadUserData();
    setFormData({
      username: user?.username || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const promptsRes = await api.get('prompts/mine/');
      const userPrompts = promptsRes.data.results || promptsRes.data;
      setPrompts(userPrompts);

      const totalLikes = userPrompts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalSaves = userPrompts.reduce((sum, p) => sum + (p.saves_count || 0), 0);

      setStats({
        totalPrompts: userPrompts.length,
        totalLikes,
        totalSaves
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('bio', formData.bio || '');

      if (avatarFile) formDataToSend.append('avatar', avatarFile);
      if (bannerFile) formDataToSend.append('banner', bannerFile);

      const response = await api.patch('auth/user/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Update successful:', response.data);

      setShowCustomizeModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setBannerFile(null);
      setBannerPreview(null);

      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to update profile: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSaving(false);
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
      <div className="profile-page">
        {/* Banner Section */}
        <div className="profile-banner">
          {user?.banner ? (
            <img src={user.banner} alt="Banner" />
          ) : (
            <div className="banner-placeholder">
              <span>No banner yet</span>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-section">
          <div className="profile-info-container">
            <div className="profile-avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder-circle">
                  {getAvatarLetters()}
                </div>
              )}
            </div>

            <div className="profile-details">
              <h1 className="profile-username">{user?.username}</h1>
              <div className="profile-stats-inline">
                <span>{stats.totalPrompts} prompts</span>
                <span>•</span>
                <span>{stats.totalLikes} likes</span>
                <span>•</span>
                <span>{stats.totalSaves} saves</span>
              </div>
              {user?.bio && (
                <p className="profile-bio-text">{user.bio}</p>
              )}
            </div>

            <button
              className="btn-customize-channel"
              onClick={() => setShowCustomizeModal(true)}
            >
              Customize Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'prompts' && (
            <div className="prompts-grid">
              {prompts.length === 0 ? (
                <div className="empty-state">
                  <p>No prompts yet. Create your first prompt!</p>
                </div>
              ) : (
                prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="prompt-card"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <h3>{prompt.title}</h3>
                    <p className="prompt-preview">{prompt.content}</p>
                    <div className="prompt-meta">
                      <span className="prompt-model">{prompt.ai_model}</span>
                      <div className="prompt-stats">
                        <span><HeartIcon size={16} /> {prompt.likes_count || 0}</span>
                        <span><BookmarkIcon size={16} /> {prompt.saves_count || 0}</span>
                        <span><EyeIcon size={16} /> {prompt.views_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <h2>About</h2>
              <div className="about-content">
                <div className="about-item">
                  <strong>Email:</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="about-item">
                  <strong>Joined:</strong>
                  <span>{new Date(user?.date_joined).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="about-item">
                  <strong>Total Prompts:</strong>
                  <span>{stats.totalPrompts}</span>
                </div>
                {user?.bio && (
                  <div className="about-item">
                    <strong>Bio:</strong>
                    <p>{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customize Profile Modal */}
      {showCustomizeModal && (
        <div className="customize-modal-overlay" onClick={() => setShowCustomizeModal(false)}>
          <div className="customize-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customize profile</h2>
              <button className="modal-close" onClick={() => setShowCustomizeModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`modal-tab ${customizeTab === 'branding' ? 'active' : ''}`}
                onClick={() => setCustomizeTab('branding')}
              >
                Branding
              </button>
              <button
                className={`modal-tab ${customizeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setCustomizeTab('basic')}
              >
                Basic info
              </button>
            </div>

            <div className="modal-content">
              {customizeTab === 'branding' && (
                <div className="branding-section">
                  <div className="upload-section">
                    <h3>Picture</h3>
                    <p className="upload-description">
                      Your profile picture will appear where your profile is presented on CommandVault
                    </p>
                    <div className="upload-preview">
                      <div className="preview-avatar">
                        {avatarPreview || user?.avatar ? (
                          <img src={avatarPreview || user.avatar} alt="Avatar" />
                        ) : (
                          <div className="avatar-placeholder-circle">
                            {getAvatarLetters()}
                          </div>
                        )}
                      </div>
                      <div className="upload-actions">
                        <input
                          type="file"
                          id="modal-avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="modal-avatar-upload" className="btn-upload">
                          Change
                        </label>
                        <p className="upload-hint">It's recommended to use a picture that's at least 98 x 98 pixels</p>
                      </div>
                    </div>
                  </div>

                  <div className="upload-section">
                    <h3>Banner image</h3>
                    <p className="upload-description">
                      This image will appear across the top of your profile
                    </p>
                    <div className="upload-preview banner-preview">
                      <div className="preview-banner">
                        {bannerPreview || user?.banner ? (
                          <img src={bannerPreview || user.banner} alt="Banner" />
                        ) : (
                          <div className="banner-placeholder-small">
                            <span>No banner</span>
                          </div>
                        )}
                      </div>
                      <div className="upload-actions">
                        <input
                          type="file"
                          id="modal-banner-upload"
                          accept="image/*"
                          onChange={handleBannerChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="modal-banner-upload" className="btn-upload">
                          Change
                        </label>
                        <p className="upload-hint">For best results, use an image that's at least 2048 x 1152 pixels</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customizeTab === 'basic' && (
                <div className="basic-info-section">
                  <div className="form-field">
                    <label>Profile name</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter profile name"
                    />
                    <p className="field-hint">Choose a name that represents you and your content</p>
                  </div>

                  <div className="form-field">
                    <label>Description</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell others about yourself. Your description will appear in the About section of your profile"
                      rows="5"
                      maxLength="1000"
                    />
                    <p className="field-hint">{(formData.bio || '').length} / 1000</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCustomizeModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn-publish"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}
    </>
  );
}
