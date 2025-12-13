import './OutputTypeFilter.css';

export default function OutputTypeFilter({ selectedTypes = ['all'], onChange }) {
    const OUTPUT_TYPES = [
        { value: 'all', label: 'All Types', icon: '⚡' },
        { value: 'text', label: 'Text', icon: '📄' },
        { value: 'image', label: 'Image', icon: '🖼' },
        { value: 'video', label: 'Video', icon: '🎬' },
        { value: 'audio', label: 'Audio', icon: '🎵' },
        { value: 'code', label: 'Code', icon: '💻' }
    ];

    const handleToggle = (type) => {
        if (type === 'all') {
            onChange(['all']);
        } else {
            const newTypes = selectedTypes.includes('all')
                ? [type]
                : selectedTypes.includes(type)
                    ? selectedTypes.filter(t => t !== type)
                    : [...selectedTypes, type];

            // If no types selected, default to 'all'
            onChange(newTypes.length === 0 ? ['all'] : newTypes.filter(t => t !== 'all'));
        }
    };

    const isSelected = (type) => {
        return selectedTypes.includes('all') ? type === 'all' : selectedTypes.includes(type);
    };

    return (
        <div className="output-type-filter">
            <span className="filter-label">Output Type:</span>
            <div className="filter-chips">
                {OUTPUT_TYPES.map(type => (
                    <button
                        key={type.value}
                        className={`filter-chip ${isSelected(type.value) ? 'active' : ''}`}
                        onClick={() => handleToggle(type.value)}
                    >
                        <span className="chip-label">{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
