import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import CreateJobListing from '../../components/CreateJobListing/CreateJobListing'
import './MyJobs.css'

function MyJobs({ user, setUser }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobBeingEdited, setJobBeingEdited] = useState(null)
  const [showCreateJobListing, setShowCreateJobListing] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [jobApplications, setJobApplications] = useState({})
  const [loadingApps, setLoadingApps] = useState({})

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

  const fetchApplicationsForJob = async (jobId) => {
    if (jobApplications[jobId]) return; // already fetched
    
    setLoadingApps(prev => ({ ...prev, [jobId]: true }))
    try {
      const response = await fetch(`/api/applications/job/${jobId}`, { credentials: 'include' })
      const json = await response.json()
      if (json.success) {
        setJobApplications(prev => ({ ...prev, [jobId]: json.data }))
      } else {
        console.error('Failed to fetch applications:', json.message)
        setJobApplications(prev => ({ ...prev, [jobId]: [] }))
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
      setJobApplications(prev => ({ ...prev, [jobId]: [] }))
    } finally {
      setLoadingApps(prev => ({ ...prev, [jobId]: false }))
    }
  }

  const handleUpdateStatus = async (jobId, applicationId, status) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      const json = await response.json()
      if (json.success) {
        setJobApplications(prev => {
          const appsForJob = prev[jobId] || []
          return {
            ...prev,
            [jobId]: appsForJob.map(app => 
              app._id === applicationId ? { ...app, status: json.data.status } : app
            )
          }
        })
      } else {
        console.error('Failed to update status:', json.message)
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const toggleApplications = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
    } else {
      setExpandedJobId(jobId)
      fetchApplicationsForJob(jobId)
    }
  }

  const applyEditedJob = (updatedJob) => {
    setJobs((prev) => prev.map((job) => (job.jobId === updatedJob.jobId ? updatedJob : job)))
  }

  const addCreatedJob = (createdJob) => {
    setJobs((prev) => [createdJob, ...prev])
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="my-jobs-container">
        <h2>{user?.username}'s Job Listings</h2>

        {loading && (
          <div className="my-job-card bg-primary">
            <div className="job-info">
              <p><strong>Loading your job listings…</strong></p>
              <p>Please wait a moment.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="my-job-card bg-primary">
            <div className="job-info">
              <p><strong>Could not load your listings</strong></p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="my-job-card bg-primary">
            <div className="job-info">
              <p><strong>No job listings yet</strong></p>
              <p>Create your first listing to start receiving applications.</p>
            </div>
            <button className="edit-btn" onClick={() => setShowCreateJobListing(true)}>
              Create Your First Listing
            </button>
          </div>
        )}

        {jobs.map((job) => (
          <div key={job.jobId} className="my-job-card bg-primary block">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
              <div className="job-info">
                <p><strong>{job.title}</strong> at {job.company}</p>
                <p>Location: {job.location} &middot; {job.jobType}</p>
                <p>Salary: {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(job.salary)}</p>
              </div>
              <div className="job-actions flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                <span className="job-date self-start sm:self-end">{new Date(job.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => toggleApplications(job.jobId)} className='edit-btn flex-1 sm:flex-none' style={{ backgroundColor: '#2da882' }}>
                    {expandedJobId === job.jobId ? 'Hide Apps' : 'View Apps'}
                  </button>
                  <button onClick={() => setJobBeingEdited(job)} className='edit-btn flex-1 sm:flex-none'>
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {expandedJobId === job.jobId && (
              <div className="mt-4 p-4 border-t border-gray-600">
                <h3 className="font-bold mb-2">Applications</h3>
                {loadingApps[job.jobId] ? (
                  <p>Loading applications...</p>
                ) : !jobApplications[job.jobId] || jobApplications[job.jobId].length === 0 ? (
                  <p>No applications yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {jobApplications[job.jobId].map((app) => (
                      <div key={app._id} className="p-3 bg-secondary rounded flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                        <div className="w-full sm:w-auto">
                          <p className="font-bold">{app.userId?.username}</p>
                          <p className="text-sm">{app.userId?.email}</p>
                          <p className="text-sm mt-1">Status: <span className="font-semibold capitalize">{app.status || 'pending'}</span></p>
                        </div>
                        <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                          <p className="text-sm self-start sm:self-end">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                            {(!app.status || app.status === 'pending') && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(job.jobId, app._id, 'accepted')}
                                  className="app-action-btn accept flex-1 sm:flex-none"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(job.jobId, app._id, 'rejected')}
                                  className="app-action-btn reject flex-1 sm:flex-none"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {(app.status === 'accepted' || app.status === 'rejected') && (
                              <button 
                                onClick={() => handleUpdateStatus(job.jobId, app._id, 'pending')}
                                className="app-action-btn undo flex-1 sm:flex-none"
                              >
                                Undo
                              </button>
                            )}
                            <Link 
                              to={`/user/${encodeURIComponent(app.userId?.username)}`} 
                              className="app-action-btn profile flex-1 sm:flex-none"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

      {showCreateJobListing && (
        <CreateJobListing
          onClose={() => setShowCreateJobListing(false)}
          onCreated={addCreatedJob}
        />
      )}
    </>
  )
}

export default MyJobs
