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
        const res = await fetch(`/api/applications/user/${encodeURIComponent(username)}`, {
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
          <div className="application-card bg-primary text-black flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl p-5 mb-4 shadow-sm">
            <div className="app-info">
              <p><strong>Loading your applications…</strong></p>
              <p className="text-sm mt-1 opacity-80">Please wait a moment.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="application-card bg-primary text-black flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl p-5 mb-4 shadow-sm">
            <div className="app-info">
              <p className="text-red-900"><strong>Could not load applications</strong></p>
              <p className="text-sm mt-1 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="application-card bg-primary text-black flex flex-col sm:flex-row justify-between items-center text-center sm:text-left rounded-xl p-5 mb-4 shadow-sm">
            <div className="app-info mb-4 sm:mb-0">
              <p className="text-lg"><strong>No applications yet</strong></p>
              <p className="text-sm mt-1 opacity-80">Browse listings and apply to track them here.</p>
            </div>
            <button className="!bg-black text-white hover:bg-neutral-800 transition-colors" onClick={() => navigate('/')}>
              Browse Job Board
            </button>
          </div>
        )}

        {applications.map((app) => (
          <div key={app._id} className="application-card bg-primary text-black flex flex-col sm:flex-row justify-between items-start sm:items-center hover:opacity-95 transition-opacity rounded-xl p-5 mb-4 shadow-sm">
            <div className="app-info mb-3 sm:mb-0">
              <p className="text-lg"><strong>{app.jobId?.title}</strong> <span className="opacity-90 font-normal">at {app.jobId?.company}</span></p>
              <p className="text-sm mt-1 opacity-80">
                {app.jobId?.location} &middot; {app.jobId?.jobType}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span> 
                <span className={`text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide capitalize ${
                  app.status === 'accepted' ? 'bg-green-900 text-green-100' :
                  app.status === 'rejected' ? 'bg-red-900 text-red-100' :
                  'bg-yellow-800 text-yellow-50'
                }`}>{app.status || 'pending'}</span>
              </div>
            </div>
            <span className="app-date self-start sm:self-end text-sm opacity-80 font-medium">Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
