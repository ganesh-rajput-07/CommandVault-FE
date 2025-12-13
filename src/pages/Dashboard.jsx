import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptCardEnhanced from "../components/PromptCardEnhanced";
import OutputTypeFilter from "../components/OutputTypeFilter";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import usePrompts from "../hooks/usePrompts";
import useNotifications from "../hooks/useNotifications";
import "./Dashboard.css";

export default function Dashboard({ type = "explore" }) {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const { setPrompts: setGlobalPrompts } = usePrompts();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedOutputTypes, setSelectedOutputTypes] = useState(["all"]);
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

      // Add output type filtering
      if (!selectedOutputTypes.includes('all') && selectedOutputTypes.length > 0) {
        selectedOutputTypes.forEach(type => {
          params.append('output_type', type);
        });
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

      // Filter by output type on client side if needed
      if (!selectedOutputTypes.includes('all') && selectedOutputTypes.length > 0) {
        data = data.filter(p => selectedOutputTypes.includes(p.output_type));
      }

      setPrompts(data);
      setFilteredPrompts(data);
      setGlobalPrompts(data); // Update global state
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
  }, [searchQuery, selectedModel, selectedOutputTypes, sortBy, type]);

  // Removed handleLike and handleSave - now handled by PromptCardEnhanced via global context

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

            {/* Output Type Filter */}
            <OutputTypeFilter
              selectedTypes={selectedOutputTypes}
              onChange={setSelectedOutputTypes}
            />

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
                      setSelectedOutputTypes(["all"]);
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
                <PromptCardEnhanced
                  key={prompt.id}
                  prompt={prompt}
                  showActions={false}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
