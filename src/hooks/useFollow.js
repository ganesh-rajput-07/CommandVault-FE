import { useState } from 'react';
import api from '../api';

export default function useFollow(userId) {
    const [isFollowing, setIsFollowing] = useState(false);

    const toggleFollow = async () => {
        try {
            const newFollowState = !isFollowing;
            setIsFollowing(newFollowState);

            await api.post('follows/toggle/', { user_id: userId });
        } catch (error) {
            setIsFollowing(!isFollowing);
            console.error('Error toggling follow:', error);
        }
    };

    return { isFollowing, toggleFollow };
}
