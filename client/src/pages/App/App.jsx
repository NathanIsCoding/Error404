import { useState, useEffect } from 'react'

import './App.css'
import Navbar from "../../components/Navbar/Navbar.jsx";
import FilterBlock from '../../components/FilterBlock/FilterBlock.jsx'
import JobCard from '../../components/JobCard/JobCard.jsx'
import SignIn from '../../components/SignIn/SignIn.jsx'
import CreateAccount from '../../components/CreateAccount/CreateAccount.jsx'
import SearchAccount from '../../components/SearchAccount/SearchAccount.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from '../Admin/Admin.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

function MainApp() {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState('')
  const [industry, setIndustry] = useState('')
  const [salary, setSalary] = useState(0)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showSearchAccount, setShowSearchAccount] = useState(false)
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

  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/loadJobs')
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          //Change this to modify how many jobs are being displayed per page.
          setJobMatrix(chunkJobs(data, 6))
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
              onDataReceived={(data) => {
                  const newData = Array.isArray(data) ? data : []
                  setJobMatrix(chunkJobs(newData, 6))
                  setCurrentPage(0)
              }}
            />
          </div>
        
          <div className="job-listings-container mx-5 grow-2">
              
              <div className='overflow-auto h-[80vh] scroll-box'>
                  {jobMatrix[currentPage]?.map((job, index) => (
                      <JobCard key={index} job={job} />
                  ))}
              </div>

              {/* Paginator */}
              <div>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>Prev</button>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === jobMatrix.length - 1}>Next</button>
              </div>

          </div>

          {/* <div className="signin-container mx-5">
            <SignIn/>
          </div> */}

        </div>
        

      </main>
      {showCreateAccount && <CreateAccount onClose={() => setShowCreateAccount(false)} />}
      {showSearchAccount && <SearchAccount onClose={() => setShowSearchAccount(false)} />}
    </>
  )
}