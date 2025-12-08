import { useState } from 'react';
import api from '../api';

export default function useFollow() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const followUser = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`auth/users/${userId}/follow/`);
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to follow user');
            setLoading(false);
            return false;
        }
    };

    const unfollowUser = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`auth/users/${userId}/unfollow/`);
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to unfollow user');
            setLoading(false);
            return false;
        }
    };

    return {
        followUser,
        unfollowUser,
        loading,
        error
    };
}
