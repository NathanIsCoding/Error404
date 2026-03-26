import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './Applications.css';

export default function Applications({ user, setUser }) {
  const { username } = useParams();
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
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && applications.length === 0 && (
          <p>No applications yet.</p>
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
