import '../SearchBar/SearchBar.css';
import React from "react";

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar">
      <input 
        className='rounded-full w-100'
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
}

export default SearchBar;