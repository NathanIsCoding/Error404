import Navbar from "./components/Navbar";
import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import FilterBlock from './components/FilterBlock/FilterBlock'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState('')
  const [industry, setIndustry] = useState('')
  const [salary, setSalary] = useState(0)

  return (
    <>
      <main>
        <aside>
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
        </aside>

        <section>
          <div className="job-listings-container">
          </div>
        </section>
      </main>
    </>
  )
}

export default App