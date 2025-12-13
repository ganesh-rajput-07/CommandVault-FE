import { useContext } from 'react';
import { PromptContext } from '../context/PromptContext';

export default function usePrompts() {
    const context = useContext(PromptContext);

    if (!context) {
        throw new Error('usePrompts must be used within a PromptProvider');
    }

    return context;
}
