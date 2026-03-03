import React from "react";
import SearchBar from "../SearchBar";
function FilterBlock(props) {
  return (
    <div className="filter-block">
      <SearchBar searchTerm={props.searchTerm} onSearchChange={(e) => props.onSearchChange(e)} />
        <br />
      <div>
        <label>Job Type: </label>
        <select value={props.jobType} onChange={(e) => props.onJobTypeChange(e)}>
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
        <select value={props.industry} onChange={(e) => props.onIndustryChange(e)}>
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
    </div>
  );
}

export default FilterBlock;