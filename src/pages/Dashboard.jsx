import { useEffect, useState, useContext } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptDetailModal from "../components/PromptDetailModal";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import "./Dashboard.css";

export default function Dashboard({ type = "explore" }) {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    try {
      let endpoint = 'prompts/';
      if (type === 'trending') endpoint = 'prompts/trending/';

      const res = await api.get(endpoint);
      setPrompts(res.data.results || res.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailModal(true);
  };

  const handleLike = async (promptId) => {
    try {
      await api.post('likes/toggle/', { prompt_id: promptId });
      loadFeed();
      if (selectedPrompt && selectedPrompt.id === promptId) {
        const res = await api.get(`prompts/${promptId}/`);
        setSelectedPrompt(res.data);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (promptId) => {
    try {
      await api.post('saved/toggle/', { prompt_id: promptId });
      alert('Prompt saved!');
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [type]);

  const pageTitle = type === 'trending' ? 'Trending Prompts' : 'Explore Prompts';

  return (
    <>
      <SEO title={pageTitle} description="Discover and share AI prompts with the community" />
      <Navbar unreadCount={unreadCount} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{pageTitle}</h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <LoadingSpinner />
          </div>
        ) : (
          <div className="prompts-grid">
            {prompts.length === 0 ? (
              <div className="empty-state">
                <p>No prompts found yet. Check back soon!</p>
              </div>
            ) : (
              prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="prompt-grid-card"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <div className="card-header">
                    <div className="owner-info">
                      {prompt.owner?.avatar_url ? (
                        <img src={prompt.owner.avatar_url} alt={prompt.owner.username} className="avatar-sm" />
                      ) : (
                        <div className="avatar-sm placeholder">
                          {prompt.owner?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="owner-name">{prompt.owner?.username}</span>
                    </div>
                    {!prompt.is_public && <span className="private-icon">🔒</span>}
                  </div>

                  <h3 className="card-title">{prompt.title}</h3>
                  <p className="card-text">{prompt.text.substring(0, 150)}...</p>

                  {prompt.ai_model && (
                    <div className="model-badge">{prompt.ai_model}</div>
                  )}

                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="card-tags">
                      {prompt.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag-sm">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="card-stats">
                    <span>❤️ {prompt.likes_count || 0}</span>
                    <span>💾 {prompt.saves_count || 0}</span>
                    <span>👁️ {prompt.usage_count || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Prompt Detail Modal */}
      {showDetailModal && selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPrompt(null);
          }}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}
    </>
  );
}
