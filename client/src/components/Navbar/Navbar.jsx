import React from 'react';
import '../Navbar/Navbar.css'

export default function Navbar({ onCreateAccount, onSearchAccount }) {

  const onSignIn = (e) => {
    e.preventDefault();
    alert("Sign In clicked.");
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (onCreateAccount) onCreateAccount();
  };

  const handleSearchAccount = (e) => {
    e.preventDefault();
    if (onSearchAccount) onSearchAccount();
  };

  const onBrowseJobs = (e) => {
    e.preventDefault();
    alert("Browse Job Opportunities clicked.");
  };

  return (
    <nav className='bg-primary navbar'>
        <div>
            <span className='logo'>JobSite</span>
        </div>
        <div className='right'>
            <a href="#" onClick={onSignIn} className='text-black link'>Sign In</a>
            <a href="#" onClick={handleCreateAccount} className='text-black link'>Create Account</a>
            <a href="#" onClick={handleSearchAccount} className='text-black link'>Search Accounts</a>
            <a href="#" onClick={onBrowseJobs} className='text-black link'>Browse Job Opportunities</a>
      </div>
    </nav>
  );
}