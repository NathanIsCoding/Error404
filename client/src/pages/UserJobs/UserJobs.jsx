import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './UserJobs.css';

export default function UserJobs({ user, setUser }) {
  const { username } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError('Could not load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [username]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="user-jobs-container">
        <h2>Jobs posted by {username}</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p>No jobs posted yet.</p>
        )}
        {jobs.map((job) => (
          <div key={job._id} className="job-card bg-primary">
            <div className="job-info">
              <p><strong>{job.title}</strong> at {job.company}</p>
              <p>Location: {job.location} &middot; {job.jobType}</p>
              <p>Salary: ${job.salary}</p>
            </div>
            <span className="job-date">{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
