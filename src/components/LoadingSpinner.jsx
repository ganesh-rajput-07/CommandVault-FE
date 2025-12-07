export default function LoadingSpinner({ size = 'md' }) {
    const sizes = {
        sm: '24px',
        md: '40px',
        lg: '60px'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
        }}>
            <div className="spinner" style={{
                width: sizes[size],
                height: sizes[size]
            }}></div>
        </div>
    );
}
