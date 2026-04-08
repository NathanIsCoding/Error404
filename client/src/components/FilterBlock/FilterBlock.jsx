import React, { useState } from "react";
import '../FilterBlock/FilterBlock.css';
import { JOB_TYPES } from '../../enums/JobTypes';
import { INDUSTRIES } from '../../enums/Industries';

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
      if (props.sort) params.append('sort', props.sort);

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
              <label className="font-bold text-xl">Sort By</label>
              <select name="sortFilter" className="bg-black text-white p-2 mt-1 rounded-sm" value={props.sort} onChange={(e) => props.onSortChange(e)}>
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="industry-asc">Industry (A-Z)</option>
                <option value="industry-desc">Industry (Z-A)</option>
              </select>
            </div>

            <br />

           <div className="flex flex-col">
              <label className="font-bold text-xl">Job Type</label>
              <select name="JobTypeFilter" className="bg-black text-white p-2 mt-1 rounded-sm" value={props.jobType} onChange={(e) => props.onJobTypeChange(e)}>
                <option value="">All</option>
                {JOB_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <br />

            <div className="flex flex-col">
              <label className="font-bold text-xl">Industry</label>
              <select name="industryFilter" className="bg-black text-white p-2 mt-1 rounded-sm" value={props.industry} onChange={(e) => props.onIndustryChange(e)}>
                <option className="bg-black" value="">All</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
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