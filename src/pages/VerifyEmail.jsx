import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './VerifyEmail.css';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}/`);
                setStatus('success');
                setMessage(res.data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {status === 'verifying' && (
                    <div className="verify-content verifying">
                        <div className="spinner"></div>
                        <h2>Verifying your email...</h2>
                        <p>Please wait while we confirm your email address</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verify-content success">
                        <div className="success-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2>Email Verified!</h2>
                        <p>{message}</p>
                        <p className="redirect-notice">Redirecting to login in 3 seconds...</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Go to Login Now
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verify-content error">
                        <div className="error-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <h2>Verification Failed</h2>
                        <p>{message}</p>
                        <div className="error-actions">
                            <button className="btn-primary" onClick={() => navigate('/login')}>
                                Go to Login
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/register')}>
                                Register Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
