import { createContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

export const PromptContext = createContext();

export function PromptProvider({ children }) {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update a single prompt in the state
    const updatePrompt = useCallback((promptId, updates) => {
        setPrompts(prev =>
            prev.map(p => p.id === promptId ? { ...p, ...updates } : p)
        );
    }, []);

    // Update prompt by slug
    const updatePromptBySlug = useCallback((slug, updates) => {
        setPrompts(prev =>
            prev.map(p => p.slug === slug ? { ...p, ...updates } : p)
        );
    }, []);

    // Toggle like for a prompt
    const toggleLike = useCallback(async (promptId) => {
        try {
            const response = await api.post('likes/toggle/', { prompt_id: promptId });

            // Fetch updated prompt data
            const promptResponse = await api.get(`prompts/${promptId}/`);
            updatePrompt(promptId, promptResponse.data);

            return response.data;
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }, [updatePrompt]);

    // Toggle save for a prompt
    const toggleSave = useCallback(async (promptId) => {
        try {
            const response = await api.post('saved/toggle/', { prompt_id: promptId });

            // Fetch updated prompt data
            const promptResponse = await api.get(`prompts/${promptId}/`);
            updatePrompt(promptId, promptResponse.data);

            return response.data;
        } catch (error) {
            console.error('Error toggling save:', error);
            throw error;
        }
    }, [updatePrompt]);

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
