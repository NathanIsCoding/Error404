import { useState, useEffect } from 'react'

import './App.css'
import Navbar from "../../components/Navbar/Navbar.jsx";
import FilterBlock from '../../components/FilterBlock/FilterBlock.jsx'
import JobCard from '../../components/JobCard/JobCard.jsx'
import SignIn from '../../components/SignIn/SignIn.jsx'
import CreateAccount from '../../components/CreateAccount/CreateAccount.jsx'
import CreateJobListing from '../../components/CreateJobListing/CreateJobListing.jsx'
import Paginator from '../../components/Paginator/Paginator.jsx';


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Admin from '../Admin/Admin.jsx';
import Applications from '../Applications/Applications.jsx';
import MyJobs from '../MyJobs/MyJobs.jsx';
import UserProfile from '../UserProfile/UserProfile.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

 //retains state on page refresh
 useEffect(() => {
    fetch('/api/accounts/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  if (authLoading) return null;
  
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<MainApp user={user} setUser={setUser} />} />
        <Route path="/admin" element={user?.isAdmin ? <Admin user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/application/:username" element={<Applications user={user} setUser={setUser} />} />
        <Route path="/my-jobs" element={user ? <MyJobs user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/user/:username" element={<UserProfile user={user} setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

function MainApp({user, setUser}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState('')
  const [industry, setIndustry] = useState('')
  const [salary, setSalary] = useState(0)
  const [sort, setSort] = useState('date-desc')
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showCreateJobListing, setShowCreateJobListing] = useState(false)
  const [jobBeingEdited, setJobBeingEdited] = useState(null)

  const [appliedJobIds, setAppliedJobIds] = useState(new Set())

  // Pagination Sate Variables
  const [jobMatrix, setJobMatrix] = useState([])
  const [currentPage, setCurrentPage] = useState(0)

  // When jobs load, chunk them into pages
  function chunkJobs(jobs, size) {
      const matrix = []
      for (let i = 0; i < jobs.length; i += size) {
          matrix.push(jobs.slice(i, i + size))
      }
      return matrix
  }

  const appendCreatedJob = (newJob) => {
    const allJobs = jobMatrix.flat()
    setJobMatrix(chunkJobs([newJob, ...allJobs], 8))
    setCurrentPage(0)
  }

  const applyEditedJob = (updatedJob) => {
    const allJobs = jobMatrix.flat().map((job) => (
      job.jobId === updatedJob.jobId ? updatedJob : job
    ))
    setJobMatrix(chunkJobs(allJobs, 8))
  }

  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch('/api/loadJobs')
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          //Change this to modify how many jobs are being displayed per page.
          setJobMatrix(chunkJobs(data, 8))
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
        }
      }

      fetchJobs()
    }, [])

  useEffect(() => {
    if (!user) {
      setAppliedJobIds(new Set())
      return
    }

    const fetchMyApplications = async () => {
      try {
        const response = await fetch(`/api/applications/${encodeURIComponent(user.username)}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          console.error('Failed to fetch user applications:', response.status)
          setAppliedJobIds(new Set())
          return
        }

        const data = await response.json()
        const ids = new Set(data.map((app) => {
          if (app.jobId && typeof app.jobId === 'object') return app.jobId._id || app.jobId
          return app.jobId
        }))
        setAppliedJobIds(ids)
      } catch (error) {
        console.error('Failed to fetch user applications:', error)
        setAppliedJobIds(new Set())
      }
    }

    fetchMyApplications()
  }, [user])

  return (
    <>
      <Navbar
        user={user}
        setUser={setUser}
        onSignIn={() => setShowSignIn(true)}
      />
      <main>
        <div className='flex justify-center h-full'>
          <div className='ml-5 w-[50vh] h-full'>
            <FilterBlock 
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              jobType={jobType}
              onJobTypeChange={(e) => setJobType(e.target.value)}
              industry={industry}
              onIndustryChange={(e) => setIndustry(e.target.value)}
              salary={salary}
              onSalaryChange={(e) => setSalary(e.target.value)}
              sort={sort}
              onSortChange={(e) => setSort(e.target.value)}
              onDataReceived={(data) => {
                  const newData = Array.isArray(data) ? data : []
                  setJobMatrix(chunkJobs(newData, 6))
                  setCurrentPage(0)
              }}
            />
          </div>
        
          <div className="job-listings-container bg-primary mx-5 grow-2 p-3 rounded-lg">
              
            <div className='overflow-auto flex-1 scroll-box rounded-lg bg-black'>
                {jobMatrix[currentPage]?.map((job, index) => (
                    <JobCard
                      className="border-b-1 border-tertiary"
                      key={index}
                      job={job}
                      user={user}
                      isApplied={appliedJobIds.has(job._id)}
                      onApplied={(jobId) => setAppliedJobIds((prev) => new Set(prev).add(jobId))}
                      onEdit={(targetJob) => setJobBeingEdited(targetJob)}
                      onRetracted={(jobId) => setAppliedJobIds((prev) => {
                        const next = new Set(prev)
                        next.delete(jobId)
                        return next
                      })}
                    />
                ))}
            </div>
              
            <div className='relative flex justify-center items-center'>
              <Paginator
                currentPage={currentPage}
                totalPages={jobMatrix.length}
                onPageChange={setCurrentPage}
              />
              {user && (
                <button onClick={() => setShowCreateJobListing(true)} className='!bg-black absolute right-0'>
                  Create Listing
                </button>
              )}
            </div>

          </div>
        </div>
        

      </main>
      {showSignIn && (
        <SignIn
          onClose={() => setShowSignIn(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowSignIn(false);
          }}
          onCreateAccount={() => {
            setShowSignIn(false);
            setShowCreateAccount(true);
          }}
        />
      )}

      {showCreateAccount && (
        <CreateAccount
          onClose={() => setShowCreateAccount(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowCreateAccount(false);
          }}
        />
      )}
      {showCreateJobListing && (
        <CreateJobListing
          onClose={() => setShowCreateJobListing(false)}
          onCreated={appendCreatedJob}
        />
      )}

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