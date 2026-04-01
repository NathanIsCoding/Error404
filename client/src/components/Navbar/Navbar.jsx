import {useState} from 'react';
import '../Navbar/Navbar.css'
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({user, setUser, onSignIn}) {

  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);


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
        <button className={`nav-button ${location.pathname === '/' ? 'active' : 'deactivated'}`}  onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className='flex'>
            <span class="material-symbols-outlined mr-1">home</span>
            Job Board
          </div>
        </button>
        {user?.isAdmin && (
          <button className={`${location.pathname === '/admin' ? 'active' : 'deactivated'}`}  onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
            <div className='flex'>
              <span class="material-symbols-outlined mr-1">admin_panel_settings</span>
              Dashboard
            </div>
          </button>
        )}
        {!user && (
          <button className='nav-button !bg-black flex' onClick={handleSignIn}>
              <span class="material-symbols-outlined mr-1">login</span>
              Sign In
          </button>
        )}
        {user && (
          <div className='user-dropdown' onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button className={`flex trigger-btn ${dropdownOpen ? '!rounded-b-none !bg-black' : '!bg-primary !text-black'}`}>
              <img
                src={`/api/accounts/${user.userId}/photo`}
                alt=""
                className='nav-profile-photo'
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className='ml-1 content-center'>{user.username}</span>
            </button>

            {dropdownOpen && (
              <div className="flex flex-col rounded-b-lg dropdown-menu">
                <button className='dropdown-button' onClick={() => navigate(`/user/${user.username}`)}>
                  View Profile
                </button>

                <button className='dropdown-button' onClick={(e) => { e.preventDefault(); navigate('/my-jobs'); }}>
                  My Jobs
                </button>

                <button className='dropdown-button' onClick={(e) => { e.preventDefault(); navigate(`/application/${user.username}`); }}>
                  My Applications
                </button>

                <button className='dropdown-button !rounded-b-lg' onClick={handleSignOut}>
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