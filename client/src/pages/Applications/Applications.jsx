import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './Applications.css';

export default function Applications({ user, setUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/applications/${encodeURIComponent(username)}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError('Could not load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [username]);

  if (!user) return <Navigate to="/" />;

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="applications-container">
        <h2>{username}'s Applications</h2>

        {loading && (
          <div className="application-card bg-primary">
            <div className="app-info">
              <p><strong>Loading your applications…</strong></p>
              <p>Please wait a moment.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="application-card bg-primary">
            <div className="app-info">
              <p><strong>Could not load applications</strong></p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="application-card bg-primary">
            <div className="app-info">
              <p><strong>No applications yet</strong></p>
              <p>Browse listings and apply to track them here.</p>
            </div>
            <button className="!bg-black" onClick={() => navigate('/')}>
              Browse Job Board
            </button>
          </div>
        )}

        {applications.map((app) => (
          <div key={app._id} className="application-card bg-primary">
            <div className="app-info">
              <p><strong>{app.jobId?.title}</strong> at {app.jobId?.company}</p>
              <p>Location: {app.jobId?.location} &middot; {app.jobId?.jobType}</p>
            </div>
            <span className="app-date">{new Date(app.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
