import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import SEO from '../components/SEO';
import { AI_MODELS, MODEL_CATEGORIES, searchModels } from '../constants/aiModels';
import './CreatePrompt.css';

export default function CreatePrompt() {
    const navigate = useNavigate();
    const [currentStage, setCurrentStage] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        ai_model: '',
        output_type: '',
        output_image: null,
        output_video: null,
        output_audio: null,
        tags: [],
        is_public: true
    });

    // Stage 2: AI Model Selection
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredModels, setFilteredModels] = useState(AI_MODELS);

    // Stage 3: Tags
    const [tagInput, setTagInput] = useState('');

    // Form state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Auto-save to localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('createPromptDraft');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
        }
    }, []);

    useEffect(() => {
        if (hasUnsavedChanges) {
            localStorage.setItem('createPromptDraft', JSON.stringify(formData));
        }
    }, [formData, hasUnsavedChanges]);

    // Search models
    useEffect(() => {
        const results = searchModels(searchQuery, selectedCategory);
        setFilteredModels(results);
    }, [searchQuery, selectedCategory]);

    // Track unsaved changes
    useEffect(() => {
        const hasData = formData.title || formData.text || formData.ai_model;
        setHasUnsavedChanges(hasData);
    }, [formData]);

    const handleNext = () => {
        if (validateStage(currentStage)) {
            setCurrentStage(prev => Math.min(prev + 1, 4));
            setError('');
        }
    };

    const handleBack = () => {
        setCurrentStage(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const validateStage = (stage) => {
        switch (stage) {
            case 1:
                if (!formData.title.trim()) {
                    setError('Please enter a title');
                    return false;
                }
                if (!formData.text.trim()) {
                    setError('Please enter prompt content');
                    return false;
                }
                if (formData.text.length > 2000) {
                    setError('Prompt content must be less than 2000 characters');
                    return false;
                }
                return true;
            case 2:
                if (!formData.ai_model) {
                    setError('Please select an AI model');
                    return false;
                }
                return true;
            case 3:
                // Optional stage, always valid
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!validateStage(3)) return;

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('text', formData.text);
            submitData.append('ai_model', formData.ai_model);
            submitData.append('is_public', formData.is_public);

            if (formData.output_type) {
                submitData.append('output_type', formData.output_type);
            }

            if (formData.output_image) {
                submitData.append('output_image', formData.output_image);
            }
            if (formData.output_video) {
                submitData.append('output_video', formData.output_video);
            }
            if (formData.output_audio) {
                submitData.append('output_audio', formData.output_audio);
            }

            if (formData.tags.length > 0) {
                submitData.append('tags', JSON.stringify(formData.tags));
            }

            await api.post('prompts/', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Clear draft
            localStorage.removeItem('createPromptDraft');

            // Navigate to My Prompts
            navigate('/my-prompts');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create prompt');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [`output_${type}`]: file
            }));
        }
    };

    const getProgressPercentage = () => {
        return (currentStage / 4) * 100;
    };

    return (
        <>
            <SEO title="Create Prompt" description="Create a new AI prompt" />

            <div className="create-prompt-container">
                {/* Header */}
                <div className="create-prompt-header">
                    <button className="back-to-prompts" onClick={() => navigate('/my-prompts')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to My Prompts
                    </button>

                    <div className="progress-indicator">
                        <span className="stage-text">Stage {currentStage}/4</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="create-prompt-content">
                    <div className="stage-container">
                        {/* Stage 1: Title & Content */}
                        {currentStage === 1 && (
                            <div className="stage stage-1" key="stage-1">
                                <h2 className="stage-title">Title & Content</h2>
                                <p className="stage-subtitle">Give your prompt a clear title and describe what it does</p>

                                <div className="form-group">
                                    <label>Prompt Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Professional Email Writer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Prompt Content *</label>
                                    <textarea
                                        placeholder="Write your prompt here..."
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        maxLength={2000}
                                        rows={10}
                                    />
                                    <div className="char-counter">
                                        {formData.text.length}/2000 characters
                                    </div>
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <div className="stage-actions">
                                    <button className="btn-next" onClick={handleNext}>
                                        Next
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stage 2: AI Model Selection */}
                        {currentStage === 2 && (
                            <div className="stage stage-2" key="stage-2">
                                <h2 className="stage-title">AI Model Selection</h2>
                                <p className="stage-subtitle">Choose which AI model this prompt is designed for</p>

                                {/* Search */}
                                <div className="model-search">
                                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search AI models..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Categories */}
                                <div className="model-categories">
                                    {MODEL_CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                {/* Models Grid */}
                                <div className="models-grid">
                                    {filteredModels.map(model => (
                                        <div
                                            key={model.id}
                                            className={`model-card ${formData.ai_model === model.name ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, ai_model: model.name })}
                                        >
                                            <div className="model-header">
                                                <h3>{model.name}</h3>
                                                {model.popular && <span className="popular-badge">Popular</span>}
                                            </div>
                                            <p className="model-provider">{model.provider}</p>
                                            <p className="model-description">{model.description}</p>
                                            {formData.ai_model === model.name && (
                                                <div className="selected-check">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {filteredModels.length === 0 && (
                                    <div className="no-results">
                                        <p>No models found. Try a different search term.</p>
                                    </div>
                                )}

                                {error && <div className="error-message">{error}</div>}

                                <div className="stage-actions">
                                    <button className="btn-back" onClick={handleBack}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="btn-next" onClick={handleNext}>
                                        Next
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stage 3: Output Type & Tags */}
                        {currentStage === 3 && (
                            <div className="stage stage-3" key="stage-3">
                                <h2 className="stage-title">Output & Tags</h2>
                                <p className="stage-subtitle">Add example outputs and tags to help others find your prompt</p>

                                <div className="form-group">
                                    <label>Output Type (Optional)</label>
                                    <select
                                        value={formData.output_type}
                                        onChange={(e) => setFormData({ ...formData, output_type: e.target.value })}
                                    >
                                        <option value="">Select output type...</option>
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                        <option value="code">Code</option>
                                    </select>
                                </div>

                                {/* File Uploads */}
                                <div className="file-uploads">
                                    <div className="form-group">
                                        <label>Example Image Output</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'image')}
                                        />
                                        {formData.output_image && (
                                            <p className="file-name">📎 {formData.output_image.name}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Example Video Output</label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileChange(e, 'video')}
                                        />
                                        {formData.output_video && (
                                            <p className="file-name">📎 {formData.output_video.name}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Example Audio Output</label>
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => handleFileChange(e, 'audio')}
                                        />
                                        {formData.output_audio && (
                                            <p className="file-name">📎 {formData.output_audio.name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="form-group">
                                    <label>Tags</label>
                                    <div className="tag-input-container">
                                        <input
                                            type="text"
                                            placeholder="Add a tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        />
                                        <button type="button" onClick={handleAddTag} className="add-tag-btn">
                                            Add
                                        </button>
                                    </div>
                                    <div className="tags-list">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="tag">
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="stage-actions">
                                    <button className="btn-back" onClick={handleBack}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="btn-next" onClick={handleNext}>
                                        Next
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stage 4: Privacy & Submit */}
                        {currentStage === 4 && (
                            <div className="stage stage-4" key="stage-4">
                                <h2 className="stage-title">Privacy & Submit</h2>
                                <p className="stage-subtitle">Review your prompt and choose who can see it</p>

                                {/* Privacy Toggle */}
                                <div className="privacy-section">
                                    <div className="privacy-toggle">
                                        <div className="toggle-info">
                                            <h3>{formData.is_public ? 'Public' : 'Private'}</h3>
                                            <p>
                                                {formData.is_public
                                                    ? 'Anyone can view and use this prompt'
                                                    : 'Only you can view this prompt'}
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_public}
                                                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="prompt-summary">
                                    <h3>Prompt Summary</h3>
                                    <div className="summary-item">
                                        <span className="label">Title:</span>
                                        <span className="value">{formData.title}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">AI Model:</span>
                                        <span className="value">{formData.ai_model}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Output Type:</span>
                                        <span className="value">{formData.output_type || 'None'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Tags:</span>
                                        <span className="value">{formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}</span>
                                    </div>
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <div className="stage-actions">
                                    <button className="btn-back" onClick={handleBack}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <button
                                        className="btn-submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Prompt'}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
