import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../api';

export const PromptContext = createContext();

export function PromptProvider({ children }) {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pendingActions = useRef(new Set());

    // Update a single prompt in the state (adds if missing)
    const updatePrompt = useCallback((promptId, updates) => {
        setPrompts(prev => {
            const index = prev.findIndex(p => p.id === promptId);
            if (index !== -1) {
                const newPrompts = [...prev];
                newPrompts[index] = { ...newPrompts[index], ...updates };
                return newPrompts;
            }
            // If it's a full prompt object, add it
            if (updates.id && updates.title) {
                return [updates, ...prev];
            }
            return prev;
        });
    }, []);

    // Update prompt by slug (adds if missing)
    const updatePromptBySlug = useCallback((slug, updates) => {
        setPrompts(prev => {
            const index = prev.findIndex(p => p.slug === slug);
            if (index !== -1) {
                const newPrompts = [...prev];
                newPrompts[index] = { ...newPrompts[index], ...updates };
                return newPrompts;
            }
            // If it's a full prompt object, add it
            if (updates.slug && updates.title) {
                return [updates, ...prev];
            }
            return prev;
        });
    }, []);

    // Toggle like for a prompt with optimistic updates
    const toggleLike = useCallback(async (promptId) => {
        if (pendingActions.current.has(`like-${promptId}`)) return;

        // Store original state for rollback
        const originalPrompt = prompts.find(p => p.id === promptId);
        if (!originalPrompt) return;

        pendingActions.current.add(`like-${promptId}`);
        const isCurrentlyLiked = originalPrompt.is_liked_by_user;
        const method = isCurrentlyLiked ? 'delete' : 'post';

        // Optimistic update - instant UI feedback
        setPrompts(prev => prev.map(p => {
            if (p.id === promptId) {
                return {
                    ...p,
                    is_liked_by_user: !p.is_liked_by_user,
                    likes_count: p.is_liked_by_user
                        ? Math.max(0, (p.likes_count || 0) - 1)
                        : (p.likes_count || 0) + 1
                };
            }
            return p;
        }));

        try {
            // New RESTful endpoint: /prompts/{slug}/like/
            const response = await api[method](`prompts/${originalPrompt.slug}/like/`);

            // Update with server response to ensure consistency
            if (response.data) {
                updatePrompt(promptId, {
                    is_liked_by_user: response.data.liked,
                    likes_count: response.data.likes_count
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error toggling like:', error);

            // Rollback on error
            if (originalPrompt) {
                updatePrompt(promptId, {
                    is_liked_by_user: originalPrompt.is_liked_by_user,
                    likes_count: originalPrompt.likes_count
                });
            }

            throw error;
        } finally {
            pendingActions.current.delete(`like-${promptId}`);
        }
    }, [prompts, updatePrompt]);

    // Toggle save for a prompt with optimistic updates
    const toggleSave = useCallback(async (promptId) => {
        if (pendingActions.current.has(`save-${promptId}`)) return;

        // Store original state for rollback
        const originalPrompt = prompts.find(p => p.id === promptId);
        if (!originalPrompt) return;

        pendingActions.current.add(`save-${promptId}`);
        const isCurrentlySaved = originalPrompt.is_saved_by_user;
        const method = isCurrentlySaved ? 'delete' : 'post';

        // Optimistic update
        setPrompts(prev => prev.map(p => {
            if (p.id === promptId) {
                return {
                    ...p,
                    is_saved_by_user: !p.is_saved_by_user,
                    saves_count: p.is_saved_by_user
                        ? Math.max(0, (p.saves_count || 0) - 1)
                        : (p.saves_count || 0) + 1
                };
            }
            return p;
        }));

        try {
            // New RESTful endpoint: /prompts/{slug}/save_prompt/
            const response = await api[method](`prompts/${originalPrompt.slug}/save_prompt/`);

            // Update with server response to ensure consistency
            if (response.data) {
                updatePrompt(promptId, {
                    is_saved_by_user: response.data.saved,
                    saves_count: response.data.saves_count
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error toggling save:', error);

            // Rollback on error
            if (originalPrompt) {
                updatePrompt(promptId, {
                    is_saved_by_user: originalPrompt.is_saved_by_user,
                    saves_count: originalPrompt.saves_count
                });
            }

            throw error;
        } finally {
            pendingActions.current.delete(`save-${promptId}`);
        }
    }, [prompts, updatePrompt]);

    // Record view for a prompt
    const recordView = useCallback(async (slug) => {
        try {
            const response = await api.post(`prompts/${slug}/record_view/`);

            // Fetch updated prompt data
            const promptResponse = await api.get(`prompts/${slug}/`);
            updatePromptBySlug(slug, promptResponse.data);

            return response.data;
        } catch (error) {
            console.error('Error recording view:', error);
            throw error;
        }
    }, [updatePromptBySlug]);

    // Add a new prompt to the state
    const addPrompt = useCallback((prompt) => {
        setPrompts(prev => [prompt, ...prev]);
    }, []);

    // Remove a prompt from the state
    const removePrompt = useCallback((promptId) => {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
    }, []);

    // Refresh prompts from API (optional - for manual refresh)
    const refreshPrompts = useCallback(async (endpoint = 'prompts/') => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(endpoint);
            setPrompts(res.data.results || res.data);
        } catch (err) {
            setError(err.message);
            console.error('Error refreshing prompts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        prompts,
        setPrompts,
        loading,
        error,
        updatePrompt,
        updatePromptBySlug,
        toggleLike,
        toggleSave,
        recordView,
        addPrompt,
        removePrompt,
        refreshPrompts
    };

    return (
        <PromptContext.Provider value={value}>
            {children}
        </PromptContext.Provider>
    );
}
