import React, { useState, useRef } from 'react';
import './ImageUploader.css';

export default function ImageUploader({ onImageSelect, initialImage = null }) {
    const [preview, setPreview] = useState(initialImage);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Simple validation
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                if (onImageSelect) onImageSelect(file, reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (onImageSelect) onImageSelect(null, null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div
            className={`image-uploader ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            <input
                ref={inputRef}
                type="file"
                className="file-input"
                accept="image/*"
                onChange={handleChange}
            />

            {preview ? (
                <div className="image-preview-container">
                    <img src={preview} alt="Upload preview" className="preview-image" />
                    <button className="remove-image-btn" onClick={removeImage}>✕</button>
                </div>
            ) : (
                <div className="upload-placeholder">
                    <div className="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <p>Click or drag image to upload reference</p>
                    <span className="upload-hint">Supports JPG, PNG, WEBP</span>
                </div>
            )}
        </div>
    );
}
