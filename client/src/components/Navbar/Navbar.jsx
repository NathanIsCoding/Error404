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
    <nav className='navbar'>
        <div>
            <span className='logo'>JobSite</span>
        </div>
        <div className='right'>
            <a href="#" onClick={onSignIn} className='link'>Sign In</a>
            <a href="#" onClick={onCreateAccount} className='link'>Create Account</a>
            <a href="#" onClick={onBrowseJobs} className='link'>Browse Job Opportunities</a>
      </div>
    </nav>
  );
}