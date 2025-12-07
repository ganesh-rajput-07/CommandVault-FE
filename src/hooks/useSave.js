import { useState } from 'react';
import api from '../api';

export default function useSave(promptId) {
    const [isSaved, setIsSaved] = useState(false);

    const toggleSave = async () => {
        try {
            const newSavedState = !isSaved;
            setIsSaved(newSavedState);

            await api.post('saved/toggle/', { prompt_id: promptId });
        } catch (error) {
            setIsSaved(!isSaved);
            console.error('Error toggling save:', error);
        }
    };

    return { isSaved, toggleSave };
}
