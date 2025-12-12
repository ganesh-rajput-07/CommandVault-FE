import { useState } from 'react';
import api from '../api';

export default function useLike(promptId, initialCount = 0) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialCount);

    const toggleLike = async () => {
        try {
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

            await api.post('likes/toggle/', { prompt_id: promptId });
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            console.error('Error toggling like:', error);
        }
    };

    return { isLiked, likeCount, toggleLike };
}
