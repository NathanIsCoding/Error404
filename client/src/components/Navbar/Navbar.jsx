import React from 'react';
import '../Navbar/Navbar.css'

export default function Navbar() {

  const onSignIn = (e) => {
    e.preventDefault();
    alert("Sign In clicked.");
  };

  const onCreateAccount = (e) => {
    e.preventDefault();
    alert("Create Account clicked.");
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
            <a href="#" onClick={onCreateAccount} className='text-black link'>Create Account</a>
            <a href="#" onClick={onBrowseJobs} className='text-black link'>Browse Job Opportunities</a>
      </div>
    </nav>
  );
}