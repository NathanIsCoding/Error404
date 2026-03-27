import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import CreateJobListing from '../../components/CreateJobListing/CreateJobListing'
import './MyJobs.css'

function MyJobs({ user, setUser }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobBeingEdited, setJobBeingEdited] = useState(null)

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const response = await fetch('/api/my-jobs', { credentials: 'include' })
        if (!response.ok) throw new Error('Failed to fetch job listings')
        const data = await response.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch my jobs:', error)
        setError('Could not load your job listings.')
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyJobs()
  }, [])

  const applyEditedJob = (updatedJob) => {
    setJobs((prev) => prev.map((job) => (job.jobId === updatedJob.jobId ? updatedJob : job)))
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="my-jobs-container">
        <h2>{user?.username}'s Job Listings</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p>You have not created any job listings yet.</p>
        )}
        {jobs.map((job) => (
          <div key={job.jobId} className="my-job-card bg-primary">
            <div className="job-info">
              <p><strong>{job.title}</strong> at {job.company}</p>
              <p>Location: {job.location} &middot; {job.jobType}</p>
              <p>Salary: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'CAD' }).format(job.salary)}</p>
            </div>
            <div className="job-actions">
              <span className="job-date">{new Date(job.createdAt).toLocaleDateString()}</span>
              <button onClick={() => setJobBeingEdited(job)} className='edit-btn'>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {jobBeingEdited && (
        <CreateJobListing
          initialJob={jobBeingEdited}
          onClose={() => setJobBeingEdited(null)}
          onUpdated={applyEditedJob}
        />
      )}
    </>
  )
}

export default MyJobs
