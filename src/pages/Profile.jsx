import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import useNotifications from '../hooks/useNotifications';
import usePrompts from '../hooks/usePrompts';
import api from '../api';
import PromptCardEnhanced from '../components/PromptCardEnhanced';
import PromptDetailModal from '../components/PromptDetailModal';
import './Profile.css';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const { setPrompts: setGlobalPrompts } = usePrompts();
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
  // New state for avatar URL
  const [useAvatarUrl, setUseAvatarUrl] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    loadUserData();
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        bio: user.bio || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_email_public: user.is_email_public || false
      }));
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const promptsRes = await api.get('prompts/mine/');
      const promptsData = promptsRes.data.results || promptsRes.data;
      setPrompts(promptsData);
      setGlobalPrompts(promptsData); // Update global state

      const totalLikes = promptsData.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalSaves = promptsData.reduce((sum, p) => sum + (p.saves_count || 0), 0);

      setStats({
        totalPrompts: promptsData.length,
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
      // Check file size (1MB = 1,000,000 bytes)
      if (file.size > 1000000) {
        alert('Avatar file size must be less than 1MB. Please choose a smaller image.');
        e.target.value = ''; // Reset input
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5,000,000 bytes)
      if (file.size > 5000000) {
        alert('Banner file size must be less than 5MB. Please choose a smaller image.');
        e.target.value = ''; // Reset input
        return;
      }

      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validate username is not empty
    if (!formData.username || formData.username.trim() === '') {
      alert('Profile name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('bio', formData.bio || '');
      formDataToSend.append('first_name', formData.first_name || '');
      formDataToSend.append('last_name', formData.last_name || '');
      formDataToSend.append('is_email_public', formData.is_email_public);

      // Handle avatar: either URL or file
      if (useAvatarUrl && avatarUrl) {
        formDataToSend.append('avatar_url', avatarUrl);
      } else if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

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

      // Show specific error message
      const errorMsg = error.response?.data?.username?.[0] ||
        error.response?.data?.avatar?.[0] ||
        error.response?.data?.banner?.[0] ||
        error.response?.data?.detail ||
        error.message;
      alert(`Failed to update profile: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const getAvatarLetters = () => {
    if (!user?.username) return 'U?';
    // Use first name if available, otherwise username
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }

    const username = user.username;
    if (username.length === 1) {
      return username.charAt(0).toUpperCase() + username.charAt(0).toUpperCase();
    }
    return (username.charAt(0) + username.charAt(1)).toUpperCase();
  };

  if (!user) {
    return <div className="profile-page-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f0f', color: 'white' }}>Loading...</div>;
  }

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
              <h1 className="profile-username">
                {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h1>
              {user?.first_name && user?.last_name && (
                <p className="profile-handle">@{user?.username}</p>
              )}

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

              {/* Email Verification Notice */}
              {!user?.is_email_verified && !user?.is_google_account && (
                <div className="verification-notice">
                  <div className="verification-content">
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '500' }}>
                      Email not verified
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post('/auth/resend-verification/');
                        alert(res.data.message);
                      } catch (error) {
                        alert(error.response?.data?.error || 'Failed to send email');
                      }
                    }}
                    className="resend-btn"
                  >
                    Resend Email
                  </button>
                </div>
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
                  <PromptCardEnhanced
                    key={prompt.id}
                    prompt={prompt}
                    showActions={false}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <h2>About</h2>
              <div className="about-content">
                <div className="about-item">
                  <strong>Full Name:</strong>
                  <span>{user?.first_name} {user?.last_name}</span>
                </div>

                {(user?.is_email_public || true) && (
                  /* Always show email to the owner, but indicate status */
                  <div className="about-item">
                    <strong>Email:</strong>
                    <span>{user?.email} {user?.is_email_public ? '(Public)' : '(Private)'}</span>
                  </div>
                )}

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
                        <div className="avatar-input-box">
                          <button
                            className={`btn-toggle ${!useAvatarUrl ? 'active' : ''}`}
                            onClick={() => setUseAvatarUrl(false)}
                          >
                            File
                          </button>
                          <button
                            className={`btn-toggle ${useAvatarUrl ? 'active' : ''}`}
                            onClick={() => setUseAvatarUrl(true)}
                          >
                            URL
                          </button>
                        </div>

                        {useAvatarUrl ? (
                          <div className="url-input-container">
                            <input
                              type="text"
                              placeholder="https://example.com/avatar.png"
                              value={avatarUrl}
                              onChange={(e) => {
                                setAvatarUrl(e.target.value);
                                setAvatarPreview(e.target.value);
                              }}
                              className="url-input"
                            />
                            <p className="upload-hint">Enter a direct link to an image (JPG, PNG)</p>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              id="modal-avatar-upload"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="modal-avatar-upload" className="btn-upload">
                              Choose File
                            </label>
                            <p className="upload-hint">Recommended: 98x98px, less than 1MB</p>
                          </>
                        )}
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
                        <p className="upload-hint">For best results, use an image that's at least 2048 x 1152 pixels and less than 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customizeTab === 'basic' && (
                <div className="basic-info-section">
                  <div className="form-field">
                    <label>Profile name (Username)</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter profile name"
                    />
                    <p className="field-hint">Your unique username on CommandVault.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-field" style={{ flex: 1 }}>
                      <label>First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="form-field" style={{ flex: 1 }}>
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Last Name"
                      />
                    </div>
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

                  <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="emailPublic"
                      checked={formData.is_email_public}
                      onChange={(e) => setFormData({ ...formData, is_email_public: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="emailPublic" style={{ marginBottom: 0, cursor: 'pointer' }}>Show email on public profile</label>
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
