import {useState, useEffect} from 'react';
import '../Navbar/Navbar.css'
import { useNavigate, useLocation } from 'react-router-dom';
import CreateTicket from '../CreateTicket/CreateTicket.jsx';

export default function Navbar({user, setUser, onSignIn, onCreateTicket}) {

  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localShowCreateTicket, setLocalShowCreateTicket] = useState(false);

  useEffect(() => {
    setDropdownOpen(false);
  }, [user]);

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

  const navigateAndClose = (path) => {
    setSheetOpen(false);
    navigate(path);
  };

  return (
    <nav className='bg-primary mb-3 navbar'>
      <div>
        <span className='logo'>JobSite</span>
      </div>
      <div className='right'>
        <button className={`${location.pathname === '/' ? 'active' : 'deactivated'}`}  onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className='flex'>
            <span className="material-symbols-outlined md:mr-1">home</span>
            <span className='hidden md:inline'>Job Board</span>
          </div>
        </button>
        {user?.isAdmin && (
          <button className={`${location.pathname === '/admin' ? 'active' : 'deactivated'}`}  onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
            <div className='flex'>
              <span className="material-symbols-outlined md:mr-1">admin_panel_settings</span>
              <span className='hidden md:inline'>Dashboard</span>
            </div>
          </button>
        )}
        {!user && (
          <button className='!bg-black flex' onClick={handleSignIn}>
              <span className="material-symbols-outlined md:mr-1">login</span>
              <span className='hidden md:inline'>Sign In</span>
          </button>
        )}
        {user && (
          <>
            {/* Desktop hover dropdown */}
            <div className='user-dropdown hidden md:inline-block' onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <button className={`flex nav-button ${dropdownOpen ? '!rounded-b-none !bg-black top-button' : '!bg-primary !text-black'}`}>
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
                  <button className='dropdown-button flex items-center gap-2' onClick={() => navigate(`/user/${user.username}`)}>
                    <span className='material-symbols-outlined text-[18px]'>person</span>
                    View Profile
                  </button>
                  <button className='dropdown-button flex items-center gap-2' onClick={(e) => { e.preventDefault(); navigate('/my-jobs'); }}>
                    <span className='material-symbols-outlined text-[18px]'>work</span>
                    My Jobs
                  </button>
                  <button className='dropdown-button flex items-center gap-2 whitespace-nowrap' onClick={(e) => { e.preventDefault(); navigate(`/application/${user.username}`); }}>
                    <span className='material-symbols-outlined text-[18px]'>assignment</span>
                    My Applications
                  </button>
                  <button className='dropdown-button flex items-center gap-2 whitespace-nowrap' onClick={(e) => { e.preventDefault(); if (onCreateTicket) onCreateTicket(); else setLocalShowCreateTicket(true); }}>
                    <span className='material-symbols-outlined text-[18px]'>support_agent</span>
                    Contact Support
                  </button>
                  <button className='dropdown-button !rounded-b-lg flex items-center gap-2' onClick={handleSignOut}>
                    <span className='material-symbols-outlined text-[18px]'>logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile tap-to-open profile button */}
            <button className='md:hidden !bg-primary !p-0' onClick={() => setSheetOpen(true)}>
              <img
                src={`/api/accounts/${user.userId}/photo`}
                alt=""
                className='nav-profile-photo'
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </button>

            {/* Mobile bottom sheet */}
            {sheetOpen && (
              <>
                {/* Backdrop */}
                <div
                  className='fixed inset-0 bg-black/50 z-40 md:hidden'
                  onClick={() => setSheetOpen(false)}
                />
                {/* Sheet */}
                <div className='fixed bottom-0 left-0 right-0 z-50 bg-[#242424] rounded-t-2xl p-4 md:hidden'>
                  <div className='flex items-center gap-3 mb-4 pb-4 border-b border-gray-600'>
                    <img
                      src={`/api/accounts/${user.userId}/photo`}
                      alt=""
                      className='nav-profile-photo'
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className='text-white font-bold text-lg'>{user.username}</span>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <button className='!bg-[#2a2a2a] text-left w-full flex items-center gap-2' onClick={() => navigateAndClose(`/user/${user.username}`)}>
                      <span className='material-symbols-outlined'>person</span>
                      View Profile
                    </button>
                    <button className='!bg-[#2a2a2a] text-left w-full flex items-center gap-2' onClick={() => navigateAndClose('/my-jobs')}>
                      <span className='material-symbols-outlined'>work</span>
                      My Jobs
                    </button>
                    <button className='!bg-[#2a2a2a] text-left w-full flex items-center gap-2' onClick={() => navigateAndClose(`/application/${user.username}`)}>
                      <span className='material-symbols-outlined'>assignment</span>
                      My Applications
                    </button>
                    <button className='!bg-[#2a2a2a] text-left w-full flex items-center gap-2' onClick={() => { setSheetOpen(false); if(onCreateTicket) onCreateTicket(); else setLocalShowCreateTicket(true); }}>
                      <span className='material-symbols-outlined'>support_agent</span>
                      Contact Support
                    </button>
                    <button className='!bg-red-800 text-left w-full flex items-center gap-2 mt-2' onClick={handleSignOut}>
                      <span className='material-symbols-outlined'>logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {localShowCreateTicket && (
        <CreateTicket onClose={() => setLocalShowCreateTicket(false)} />
      )}
    </nav>
  );
}
