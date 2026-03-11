import { useState } from 'react'

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

  return (
    <>
      <Navbar onCreateAccount={() => setShowCreateAccount(true)} onSearchAccount={() => setShowSearchAccount(true)} />
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

          <div className="signin-container mx-5">
            <SignIn/>
          </div>

        </div>
        

      </main>
      {showCreateAccount && <CreateAccount onClose={() => setShowCreateAccount(false)} />}
      {showSearchAccount && <SearchAccount onClose={() => setShowSearchAccount(false)} />}
    </>
  )
}

export default App