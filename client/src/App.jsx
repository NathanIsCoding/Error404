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
     <Navbar/>
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
            />
          </div>
        
          <div className="job-listings-container mx-5 grow-2">
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