import { useState, useEffect } from 'react'

import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import FilterBlock from './components/FilterBlock/FilterBlock.jsx'
import JobCard from './components/JobCard/JobCard.jsx'
import SignIn from './components/SignIn/SignIn.jsx'
import CreateAccount from './components/CreateAccount/CreateAccount.jsx'
import SearchAccount from './components/SearchAccount/SearchAccount.jsx'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState('')
  const [industry, setIndustry] = useState('')
  const [salary, setSalary] = useState(0)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showSearchAccount, setShowSearchAccount] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/loadJobs')
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          setJobs(Array.isArray(data) ? data : [])
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
        }
      }

      fetchJobs()
    }, [])

  return (
    <>
      <Navbar
        onCreateAccount={() => setShowCreateAccount(true)}
        onSearchAccount={() => setShowSearchAccount(true)}
        onSignIn={() => setShowSignIn(true)}
      />
      <main>
        <div className='flex justify-center'>
          <div className='ml-5 grow-1'>
            <FilterBlock 
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              jobType={jobType}
              onJobTypeChange={(e) => setJobType(e.target.value)}
              industry={industry}
              onIndustryChange={(e) => setIndustry(e.target.value)}
              salary={salary}
              onSalaryChange={(e) => setSalary(e.target.value)}
              onDataReceived={(data) => setJobs(Array.isArray(data) ? data : [])}
            />
          </div>
        
          <div className="job-listings-container mx-5 grow-2">
            {jobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>

        </div>
        

      </main>
      {showCreateAccount && <CreateAccount onClose={() => setShowCreateAccount(false)} />}
      {showSearchAccount && <SearchAccount onClose={() => setShowSearchAccount(false)} />}
      {showSignIn && <SignIn onClose={() => setShowSignIn(false)} />}
    </>
  )
}

export default App