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
        ai_model: [], // Changed from string to array for multi-select
        output_type: '',
        example_output: '',
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
        const hasData = formData.title || formData.text || formData.ai_model.length > 0;
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
                if (formData.text.length > 50000) {
                    setError('Prompt content must be less than 50,000 characters');
                    return false;
                }
                return true;
            case 2:
                if (formData.ai_model.length === 0) {
                    setError('Please select at least one AI model');
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
        // Final validation of all critical stages
        if (!validateStage(1) || !validateStage(2)) {
            setCurrentStage(1);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('text', formData.text);

            // Handle multi-select AI models
            submitData.append('ai_model', JSON.stringify(formData.ai_model));

            submitData.append('is_public', formData.is_public);

            if (formData.output_type) {
                submitData.append('output_type', formData.output_type);
            }

            if (formData.example_output) {
                submitData.append('example_output', formData.example_output);
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

            // Success! 
            // 1. Clear draft
            localStorage.removeItem('createPromptDraft');

            // 2. Set loading to false before navigation to avoid UI flicker/stuck state
            setLoading(false);

            // 3. Navigate to My Prompts
            navigate('/my-prompts', { replace: true });
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.detail || 'Failed to create prompt. Please check your connection.');
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
        <div className="create-prompt-container">
            <SEO title="Create Prompt" description="Create a new AI prompt" />

            <div className="create-prompt-header">
                <div className="header-top">
                    <button className="back-to-prompts" onClick={() => navigate('/my-prompts')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Exit to My Prompts
                    </button>
                </div>

                <div className="progress-stepper">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`step-item ${currentStage === step ? 'active' : ''} ${currentStage > step ? 'completed' : ''}`}
                            onClick={() => currentStage > step && setCurrentStage(step)}
                        >
                            <div className="step-circle">
                                {currentStage > step ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                ) : step}
                            </div>
                            <span className="step-label">
                                {step === 1 ? 'Details' : step === 2 ? 'AI Model' : step === 3 ? 'Output' : 'Review'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="create-prompt-content">
                <div className="stage-container">
                    {/* Stage 1: Title & Content */}
                    {currentStage === 1 && (
                        <div className="stage" key="stage-1">
                            <div className="stage-title-group">
                                <h2 className="stage-title">Core Details</h2>
                                <p className="stage-subtitle">Give your prompt a clear identity and define its purpose</p>
                            </div>

                            <div className="form-section">
                                <div className="form-group">
                                    <div className="label-wrapper">
                                        <label>Prompt Title <span className="required-dot">•</span></label>
                                    </div>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        placeholder="e.g., Professional Email Ghostwriter"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="form-group">
                                    <div className="label-wrapper">
                                        <label>Prompt Content <span className="required-dot">•</span></label>
                                    </div>
                                    <textarea
                                        className="modern-textarea"
                                        placeholder="Paste or write your prompt instructions here..."
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        maxLength={50000}
                                    />
                                    <div className="char-counter">
                                        {formData.text.length.toLocaleString()} / 50,000 characters
                                    </div>
                                </div>
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="navigation-actions">
                                <span /> {/* Placeholder for back button spacing */}
                                <button className="btn-nav-next" onClick={handleNext}>
                                    Selection AI Model
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: AI Model Selection */}
                    {currentStage === 2 && (
                        <div className="stage" key="stage-2">
                            <div className="stage-title-group">
                                <h2 className="stage-title">AI Compatibility</h2>
                                <p className="stage-subtitle">Select the models this prompt is specifically optimized for</p>
                            </div>

                            <div className="model-selection-area">
                                <div className="model-search-bar">
                                    <svg className="search-icon-inline" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        placeholder="Search for models (e.g. GPT-4, Claude, Midjourney)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="filter-pills">
                                    {MODEL_CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                <div className="models-grid">
                                    {filteredModels.map(model => (
                                        <div
                                            key={model.id}
                                            className={`model-card-modern ${formData.ai_model.includes(model.name) ? 'selected' : ''}`}
                                            onClick={() => {
                                                const isSelected = formData.ai_model.includes(model.name);
                                                let newModels = [...formData.ai_model];

                                                if (model.name === 'Universal') {
                                                    newModels = isSelected ? [] : ['Universal'];
                                                } else {
                                                    if (isSelected) {
                                                        newModels = newModels.filter(m => m !== model.name);
                                                    } else {
                                                        newModels = newModels.filter(m => m !== 'Universal');
                                                        newModels.push(model.name);
                                                    }
                                                }
                                                setFormData({ ...formData, ai_model: newModels });
                                            }}
                                        >
                                            <span className="provider">{model.provider}</span>
                                            <h4>{model.name}</h4>
                                            <p className="desc">{model.description}</p>

                                            {formData.ai_model.includes(model.name) && (
                                                <div className="selected-badge">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="navigation-actions">
                                <button className="btn-nav-back" onClick={handleBack}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    Previous Step
                                </button>
                                <button className="btn-nav-next" onClick={handleNext}>
                                    Next: Rich Media
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Output & Tags */}
                    {currentStage === 3 && (
                        <div className="stage" key="stage-3">
                            <div className="stage-title-group">
                                <h2 className="stage-title">Rich Outputs</h2>
                                <p className="stage-subtitle">Showcase example results and add tags for better discoverability</p>
                            </div>

                            <div className="form-section">
                                <div className="form-group">
                                    <label>Choose Output Category</label>
                                    <select
                                        className="modern-select"
                                        value={formData.output_type}
                                        onChange={(e) => setFormData({ ...formData, output_type: e.target.value })}
                                    >
                                        <option value="">Select output type...</option>
                                        <option value="text">Textual Output</option>
                                        <option value="image">Generative Image</option>
                                        <option value="video">Motion Video</option>
                                        <option value="audio">Voice / Audio</option>
                                        <option value="code">Source Code</option>
                                    </select>
                                </div>

                                {formData.output_type && (
                                    <div className="dynamic-output-area">
                                        {(formData.output_type === 'text' || formData.output_type === 'code') && (
                                            <div className="form-group">
                                                <label>Example {formData.output_type === 'code' ? 'Code' : 'Text'} Preview</label>
                                                <textarea
                                                    className="modern-textarea"
                                                    placeholder={`Paste the expected ${formData.output_type} output here...`}
                                                    rows={8}
                                                    value={formData.example_output || ''}
                                                    onChange={(e) => setFormData({ ...formData, example_output: e.target.value })}
                                                    style={formData.output_type === 'code' ? { fontFamily: 'monospace' } : {}}
                                                />
                                            </div>
                                        )}

                                        {['image', 'video', 'audio'].includes(formData.output_type) && (
                                            <div className="upload-grid">
                                                <div className="upload-card" onClick={() => document.getElementById('file-upload').click()}>
                                                    <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                                    </svg>
                                                    <div className="upload-text">Upload {formData.output_type}</div>
                                                    <div className="upload-subtext">Click to browse or drag and drop</div>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        hidden
                                                        accept={`${formData.output_type}/*`}
                                                        onChange={(e) => handleFileChange(e, formData.output_type)}
                                                    />
                                                    {formData[`output_${formData.output_type}`] && (
                                                        <div className="file-name" style={{ marginTop: '12px' }}>
                                                            Successfully Selected: {formData[`output_${formData.output_type}`].name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-section">
                                <div className="form-group">
                                    <label>Keywords & Tags</label>
                                    <div className="tag-input-box">
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="Press Enter to add tags..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        />
                                        <button type="button" onClick={handleAddTag} className="btn-add-tag">
                                            Add Tag
                                        </button>
                                    </div>
                                    <div className="tags-container">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="modern-tag">
                                                <span>#{tag}</span>
                                                <button className="btn-remove-tag" onClick={() => handleRemoveTag(tag)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="navigation-actions">
                                <button className="btn-nav-back" onClick={handleBack}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    Model Selection
                                </button>
                                <button className="btn-nav-next" onClick={handleNext}>
                                    Final Review
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Privacy & Submit */}
                    {currentStage === 4 && (
                        <div className="stage" key="stage-4">
                            <div className="stage-title-group">
                                <h2 className="stage-title">Ready for Launch</h2>
                                <p className="stage-subtitle">Review your creation and set visibility before publishing to the vault</p>
                            </div>

                            <div className="form-section">
                                <div className={`privacy-card ${formData.is_public ? 'active' : ''}`}>
                                    <div className="privacy-info">
                                        <h4>{formData.is_public ? 'Public Access' : 'Private Vault'}</h4>
                                        <p style={{ color: '#666', fontSize: '0.875rem' }}>
                                            {formData.is_public
                                                ? 'Visible to the entire CommandVault community'
                                                : 'Only you can see and use this prompt in your profile'}
                                        </p>
                                    </div>
                                    <label className="switch-modern">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        />
                                        <span className="slider-modern"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="configuration-title">Final Configuration</h4>
                                <div className="summary-list">
                                    <div className="summary-item">
                                        <span className="summary-label">Title</span>
                                        <span className="summary-value">{formData.title}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Models</span>
                                        <span className="summary-value">{formData.ai_model.join(', ') || 'None Selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Output</span>
                                        <span className="summary-value">{formData.output_type || 'Unspecified'}</span>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="navigation-actions">
                                <button className="btn-nav-back" onClick={handleBack}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    Back to Media
                                </button>
                                <button
                                    className="btn-nav-submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>Creating...</>
                                    ) : (
                                        <>
                                            Publish Prompt
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
