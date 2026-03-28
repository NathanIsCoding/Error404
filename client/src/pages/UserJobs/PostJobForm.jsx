import { useState } from 'react';

export default function PostJobForm({ username, onJobPosted }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    jobType: 'full-time',
    industry: '',
    salary: '',
    location: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, salary: Number(form.salary) })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post job');
      }
      setSuccess('Job posted successfully!');
      setForm({
        title: '', company: '', jobType: 'full-time', industry: '', salary: '', location: '', description: ''
      });
      if (onJobPosted) onJobPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="post-job-form" onSubmit={handleSubmit}>
      <h3>Post a New Job</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
      <label>Company<input name="company" value={form.company} onChange={handleChange} required /></label>
      <label>Job Type
        <select name="jobType" value={form.jobType} onChange={handleChange} required>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </label>
      <label>Industry<input name="industry" value={form.industry} onChange={handleChange} required /></label>
      <label>Salary<input name="salary" type="number" value={form.salary} onChange={handleChange} required min="0" /></label>
      <label>Location<input name="location" value={form.location} onChange={handleChange} required /></label>
      <label>Description<textarea name="description" value={form.description} onChange={handleChange} required /></label>
      <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
    </form>
  );
}
