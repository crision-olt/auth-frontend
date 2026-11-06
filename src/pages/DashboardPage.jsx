import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await api.getMe();
        if (result.error) {
          navigate('/');
        } else {
          setUser(result);
        }
      } catch (err) {
        setError('Failed to load user');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/');
    } catch (err) {
      setError('Logout failed');
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome!</h1>
        
        <div className="user-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Created:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
        </div>

        <div className="dashboard-links">
          <h2>Demo Applications</h2>
          <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
            Go to Demo App
          </a>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
