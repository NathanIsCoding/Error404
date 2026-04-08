import React, { useState } from 'react';
import './SignIn.css';

const SignIn = ({ onClose, onSuccess, onCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages on each attempt
    setErrorMessage('');
    setResponseMessage('');

    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed');
        return;
      }

      if (data.success) {
        setResponseMessage('Success! Logged in.');
        
        // Fetch the user info, then notify the parent
        const me = await fetch('/api/accounts/me', {
          credentials: 'include'
        });
        const userData = await me.json();
        onSuccess(userData);
        
        setTimeout(() => onClose(), 2000);
      } else {
        setErrorMessage('Unexpected response');
      }

    } catch (error) {
      console.error('Error fetching account:', error);
      setErrorMessage('Unable to connect to server');
    }
  };

  return (
    <div className="login-modal">
      <div className="login">
        <button className='close-button click-button !bg-secondary flex justify-center items-center' onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
        </button>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className='flex justify-between'>
            <button type="button" onClick={onCreateAccount}>Create Account</button>
            <button type="submit">Login</button>
          </div>
         
        </form>

        {responseMessage && (
          <p style={{ color: 'green', marginTop: '11px', fontSize: '30px', textAlign: 'center' }}>
            {responseMessage}
          </p>
        )}

        {errorMessage && (
          <p style={{ color: 'red', marginTop: '11px', fontSize: '16px', textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignIn;