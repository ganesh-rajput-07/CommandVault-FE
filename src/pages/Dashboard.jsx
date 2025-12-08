import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import UserCard from "../components/UserCard";
import { HeartIcon, BookmarkIcon, EyeIcon } from "../components/AnimatedIcons";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import "./Dashboard.css";

export default function Dashboard({ type = "explore" }) {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const AI_MODELS = ["all", "ChatGPT", "Claude", "Gemini", "Midjourney", "DALL-E", "Other"];
  const SORT_OPTIONS = [
    { value: "recent", label: "Most Recent" },
    { value: "trending", label: "Trending" },
    { value: "likes", label: "Most Liked" },
    { value: "saves", label: "Most Saved" }
  ];

  const loadFeed = async () => {
    setLoading(true);
    try {
      let endpoint = 'prompts/';
      if (type === 'trending') endpoint = 'prompts/trending/';

      // Build query parameters
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (selectedModel !== 'all') {
        params.append('ai_model', selectedModel);
      }

      const queryString = params.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const res = await api.get(fullEndpoint);
      let data = res.data.results || res.data;

      // Client-side sorting
      switch (sortBy) {
        case "trending":
          data.sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));
          break;
        case "likes":
          data.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
          break;
        case "saves":
          data.sort((a, b) => (b.saves_count || 0) - (a.saves_count || 0));
          break;
        case "recent":
        default:
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
      }

      setPrompts(data);
      setFilteredPrompts(data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeed();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedModel, sortBy, type]);

  const handlePromptClick = (promptSlug) => {
    navigate(`/prompt/${promptSlug}`);
  };

  const handleLike = async (e, promptId) => {
    if (e && e.stopPropagation) e.stopPropagation();

    try {
      await api.post('likes/toggle/', { prompt_id: promptId });
      const res = await api.get(`prompts/${promptId}/`);

      setPrompts(prevPrompts =>
        prevPrompts.map(p => p.id === promptId ? res.data : p)
      );
      setFilteredPrompts(prevPrompts =>
        prevPrompts.map(p => p.id === promptId ? res.data : p)
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e, promptId) => {
    if (e && e.stopPropagation) e.stopPropagation();

    try {
      await api.post('saved/toggle/', { prompt_id: promptId });
      const res = await api.get(`prompts/${promptId}/`);

      setPrompts(prevPrompts =>
        prevPrompts.map(p => p.id === promptId ? res.data : p)
      );
      setFilteredPrompts(prevPrompts =>
        prevPrompts.map(p => p.id === promptId ? res.data : p)
      );
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const pageTitle = type === 'trending' ? 'Trending Prompts' : 'Explore Prompts';

  return (
    <>
      <SEO title={pageTitle} description="Discover and share AI prompts with the community" />
      <Navbar unreadCount={unreadCount} />

      <div className="dashboard-container">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Amazing <span className="gradient-text">AI Prompts</span>
            </h1>
            <p className="hero-subtitle">
              Explore thousands of prompts created by the community
            </p>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search prompts by title, content, tags, username, or AI model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery("")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">{prompts.length}</span>
                <span className="stat-label">Prompts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{filteredPrompts.length}</span>
                <span className="stat-label">Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-container">
            {/* AI Model Filters */}
            <div className="filter-group">
              <span className="filter-label">AI Model:</span>
              <div className="filter-chips">
                {AI_MODELS.map(model => (
                  <button
                    key={model}
                    className={`filter-chip ${selectedModel === model ? 'active' : ''}`}
                    onClick={() => setSelectedModel(model)}
                  >
                    {model === "all" ? "All Models" : model}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="sort-group">
              <span className="filter-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="prompts-grid">
            {filteredPrompts.length === 0 ? (
              <div className="empty-state">
                {searchQuery || selectedModel !== "all" ? (
                  <>
                    <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No prompts found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button className="btn-clear-filters" onClick={() => {
                      setSearchQuery("");
                      setSelectedModel("all");
                    }}>
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No prompts yet</h3>
                    <p>Check back soon for amazing AI prompts!</p>
                  </>
                )}
              </div>
            ) : (
              filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="prompt-card"
                  onClick={() => handlePromptClick(prompt.slug)}
                >
                  <div className="card-header">
                    {prompt.owner && (
                      <UserCard
                        user={prompt.owner}
                        showFollowButton={true}
                        size="small"
                      />
                    )}
                    {!prompt.is_public && <span className="private-badge">🔒</span>}
                  </div>

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
                    <span className="stat-item" onClick={(e) => handleLike(e, prompt.id)}>
                      <HeartIcon isLiked={prompt.is_liked_by_user || false} size={20} />
                      <span className="stat-count">{prompt.likes_count || 0}</span>
                    </span>
                    <span className="stat-item" onClick={(e) => handleSave(e, prompt.id)}>
                      <BookmarkIcon isSaved={prompt.is_saved_by_user || false} size={20} />
                      <span className="stat-count">{prompt.saves_count || 0}</span>
                    </span>
                    <span className="stat-item">
                      <EyeIcon isViewing={prompt.is_viewed_by_user || false} size={20} />
                      <span className="stat-count">{prompt.usage_count || 0}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
