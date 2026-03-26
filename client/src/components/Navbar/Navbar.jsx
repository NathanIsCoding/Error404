import React from 'react';
import '../Navbar/Navbar.css'
import { useNavigate } from 'react-router-dom';
import SignIn from '../SignIn/SignIn';
import CreateAccount from '../CreateAccount/CreateAccount';

export default function Navbar({user, setUser, onSignIn, onCreateAccount}) {

  const navigate = useNavigate();

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if(onCreateAccount) onCreateAccount();
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    if(onSignIn) onSignIn();
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/accounts/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className='bg-primary mb-3 navbar'>
        <div>
            <span className='logo'>JobSite</span>
        </div>
        <div className='right'>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className='text-black link'>Job Board</a>
            {user && (
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/application/${user.username}`); }} className='text-black link'>My Applications</a>
            )}
            {user?.isAdmin && (
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className='text-black link'>Admin Dashboard</a>
            )}
            {user ? (
              <>
                <a href="#" onClick={handleSignOut} className='text-black link'>Sign Out</a>
              </>
            ) : (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); handleSignIn(e); }} className='text-black link'>Sign In</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleCreateAccount(e); }} className='text-black link'>Create Account</a>
              </>
            )}
            
      </div>
    </nav>
  );
}