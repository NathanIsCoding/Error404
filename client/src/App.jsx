import { useState } from 'react'
import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import FilterBlock from './components/FilterBlock/FilterBlock.jsx'
import JobCard from './components/JobCard/JobCard.jsx'


function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState('')
  const [industry, setIndustry] = useState('')
  const [salary, setSalary] = useState(0)

  return (
    <>
      <main>
        <Navbar/>
        <div className='flex'>
          <div>
            <FilterBlock 
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              jobType={jobType}
              onJobTypeChange={(e) => setJobType(e.target.value)}
              industry={industry}
              onIndustryChange={(e) => setIndustry(e.target.value)}
              salary={salary}
              onSalaryChange={(e) => setSalary(e.target.value)}
            />
          </div>
        
          <div className="job-listings-container">
            <JobCard/>
            <JobCard/>
            <JobCard/>
          </div>

        </div>
        

      </main>
    </>
  )
}

export default App