import {useState} from 'react';
import '../Navbar/Navbar.css'
import { useNavigate } from 'react-router-dom';

export default function Navbar({user, setUser, onSignIn, onCreateAccount, onCreateJobListing}) {

  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* {user && (
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-jobs'); }} className='text-black link'>My Job Listings</a>
        )}
        {user && (
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/application/${user.username}`); }} className='text-black link'>My Applications</a>
        )} */}
        {user?.isAdmin && (
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className='text-black link'>Admin Dashboard</a>
        )}
        {!user && (
          <button onClick={handleSignIn}>Sign In</button>
        )}
        {user && (
          <div className='user-dropdown  ' onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button className={`flex trigger-btn !bg-black ${dropdownOpen ? '!rounded-b-none' : ''}`}>
              <img
                src={`/api/accounts/${user.userId}/photo`}
                alt=""
                className='nav-profile-photo'
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className='ml-1 content-center'>{user.username}</span>
            </button>

            {dropdownOpen && (
              <div className="flex flex-col bg-black rounded-b-lg dropdown-menu">
                <button className='!bg-none' onClick={() => navigate(`/user/${user.username}`)}>
                  View Profile
                </button>

                <button onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}