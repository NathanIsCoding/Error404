import React, { useState } from "react";
import '../FilterBlock/FilterBlock.css';

function FilterBlock(props) {
  const [searchTerm, setSearchTerm] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      props.onDataReceived(data, `Success: ${data.message || 'Search completed'}`);
    } catch (error) {
      console.error('Search error:', error);
      props.onDataReceived([], `Error: ${error.message}`);
    }
  };
  
  return (
    <div className="bg-primary filter-block">
      <form>
         <div className="search-bar">
            <input 
              className='rounded-full w-100 pl-5 p-3'
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <br />
        <div>
           <div>
              <label>Job Type: </label>
              <select className="bg-black text-white" value={props.jobType} onChange={(e) => props.onJobTypeChange(e)}>
                <option value="">All</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <br />

            <div>
              <label>Industry: </label>
              <select className="bg-black text-white" value={props.industry} onChange={(e) => props.onIndustryChange(e)}>
                <option value="">All</option>
                <option value="tech">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
              </select>
            </div>

            <br />

            <div>
              <label>Minimum Salary: ${props.salary ? props.salary : 0}</label>
              <br />
              <input 
                type="range" 
                min="0" 
                max="200000" 
                step="5000" 
                value={props.salary ? props.salary : 0} 
                onChange={(e) => props.onSalaryChange(e)} 
              />
            </div>
            <div>
              <button onClick={handleSubmit}>
                Submit
              </button>
            </div>
        </div>

      </form>
    </div>
  );
}

export default FilterBlock;