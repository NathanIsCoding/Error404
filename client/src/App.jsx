import Navbar from "./components/Navbar/Navbar";
import SignIn from "./components/SignIn/SignIn";
import JobCard from "./components/JobCard/JobCard";
import FilterBlock from "./components/FilterBlock/FilterBlock";
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <FilterBlock/>
    <JobCard/>
    <Navbar/>
    <SignIn/>
    </>
  )
}

export default App
