import React from 'react';
import '../Navbar/Navbar.css'
import { useNavigate } from 'react-router-dom';
import SignIn from '../SignIn/SignIn';

export default function Navbar() {

  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    // if(onSignIn) onSignIn();
  };

  return (
    <nav className='bg-primary mb-3 navbar'>
        <div>
            <span className='logo'>JobSite</span>
        </div>
        <div className='right'>
            <a href="" onClick={() => navigate('/admin')} className='text-black link'>Admin Dashboard</a>
            <a href="" onClick={handleSignIn} className='text-black link'>Sign In</a>
            {/* <a href="#" onClick={handleCreateAccount} className='text-black link'>Create Account</a>
            <a href="#" onClick={handleSearchAccount} className='text-black link'>Search Accounts</a> */}
            <a href="" onClick={() => navigate('/')} className='text-black link'>Browse Job Opportunities</a>
      </div>
    </nav>
  );
}