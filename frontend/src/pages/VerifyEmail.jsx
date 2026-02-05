import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect to login or show error
      setError('No email found. Please register or login first.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/verify-email', {
        email,
        code
      });

      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/resend-otp', { email });
      setMessage(response.data.message);
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Email</h2>
        <p>Please enter the 6-digit code sent to <strong>{email}</strong></p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="123456"
              disabled={loading}
              maxLength="6"
              style={{ letterSpacing: '0.5em', fontSize: '1.2em', textAlign: 'center' }}
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading || !email}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        <div className="auth-footer">
          <button 
            onClick={handleResend} 
            disabled={loading || !email}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
