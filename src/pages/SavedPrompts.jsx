import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptCardEnhanced from "../components/PromptCardEnhanced";
import SEO from "../components/SEO";
import usePrompts from "../hooks/usePrompts";
import useNotifications from "../hooks/useNotifications";
import "./Dashboard.css";

export default function SavedPrompts() {
    const { unreadCount } = useNotifications();
    const { setPrompts: setGlobalPrompts } = usePrompts();
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSavedPrompts = async () => {
        setLoading(true);
        try {
            const res = await api.get('saved/my_saved/');
            // Extract prompts from saved objects
            const savedPrompts = (res.data.results || res.data).map(saved => saved.prompt);
            setPrompts(savedPrompts);
            setGlobalPrompts(savedPrompts); // Update global state
        } catch (error) {
            console.error('Error loading saved prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed handlePromptClick - handled by PromptCardEnhanced

    const handleUnsave = async (e, prompt) => {
        if (e) e.stopPropagation();
        try {
            await api.post('saved/toggle/', { prompt_id: prompt.id });
            // Remove from list
            setPrompts(prev => prev.filter(p => p.id !== prompt.id));
        } catch (error) {
            console.error('Error unsaving prompt:', error);
        }
    };

    useEffect(() => {
        loadSavedPrompts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <SEO title="Saved Prompts" description="Your saved AI prompts collection" />
            <Navbar unreadCount={unreadCount} />

            <div className="dashboard-container">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-background"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Saved <span className="gradient-text">Prompts</span>
                        </h1>
                        <p className="hero-subtitle">
                            Your collection of bookmarked prompts
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="content-section">
                    <div className="content-wrapper">
                        {loading ? (
                            <div className="loading-container">
                                <LoadingSpinner />
                            </div>
                        ) : prompts.length === 0 ? (
                            <div className="empty-state">
                                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                                <h3>No saved prompts yet</h3>
                                <p>Start bookmarking prompts you find useful to build your collection</p>
                                <button className="btn-clear-filters" onClick={() => navigate('/explore')}>
                                    Explore Prompts
                                </button>
                            </div>
                        ) : (
                            <div className="prompts-grid">
                                {prompts.map((prompt) => (
                                    <PromptCardEnhanced
                                        key={prompt.id}
                                        prompt={prompt}
                                        showActions={true}
                                        onDelete={(p) => handleUnsave(null, p)}
                                        deleteLabel="Unsave"
                                        deleteIcon={
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                            </svg>
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
