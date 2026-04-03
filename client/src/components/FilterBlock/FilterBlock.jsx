import React, { useState } from "react";
import '../FilterBlock/FilterBlock.css';

function FilterBlock(props) {
  const [searchTerm, setSearchTerm] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (props.jobType) params.append('jobType', props.jobType);
      if (props.industry) params.append('industry', props.industry);
      if (props.salary && Number(props.salary) > 0) params.append('salary', props.salary);

      const response = await fetch(`/api/search?${params.toString()}`, {
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
    <div className="bg-primary flex flex-col filter-block">
      <form>
         <div className="search-bar flex">
            <input 
              className='rounded-full grow pl-5 p-3'
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <br />
        <div className="p-2">
           <div className="flex flex-col">
              <label className="font-bold text-xl">Job Type</label>
              <select name="JobTypeFilter" className="bg-black text-white p-2 mt-1 rounded-sm" value={props.jobType} onChange={(e) => props.onJobTypeChange(e)}>
                <option value="">All</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <br />

            <div className="flex flex-col">
              <label className="font-bold text-xl">Industry</label>
              <select name="industryFilter" className="bg-black text-white p-2 mt-1 rounded-sm" value={props.industry} onChange={(e) => props.onIndustryChange(e)}>
                <option className="bg-black" value="">All</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Construction">Construction</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Transportation and Logistics">Transportation and Logistics</option>
                <option value="Sales">Sales</option>
                <option value="Marketing and Advertising">Marketing and Advertising</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Government and Public Administration">Government and Public Administration</option>
                <option value="Engineering">Engineering</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Media and Entertainment">Media and Entertainment</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Energy and Utilities">Energy and Utilities</option>
                <option value="Legal Services">Legal Services</option>
              </select>
            </div>

            <br />

            <div>
              <label className="font-bold text-xl">Minimum Salary: ${props.salary ? props.salary : 0}</label>
              <br />
              <input className="accent-secondary"
                type="range" 
                min="0" 
                max="200000" 
                step="5000" 
                value={props.salary ? props.salary : 0} 
                onChange={(e) => props.onSalaryChange(e)} 
              />
            </div>

            <div className="filter-submit-wrap">
              <button className="!bg-black" onClick={handleSubmit}>
                Submit
              </button>
            </div>
        </div>

      </form>
    </div>
  );
}

export default FilterBlock;