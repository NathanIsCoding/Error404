import React, { useState } from 'react';
import './SignIn.css';

const Signin=({onClose})=> {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();

    const account = { username, email, password };
    try {
      const response = await fetch('http://localhost:3000/api/accounts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      const data = await response.json();
      if (response.ok) {
        setResponseMessage(`Success: ${data.message}`);
      } else {
        setResponseMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setResponseMessage('Error: Unable to connect to server');
    }
  };

    return (
        
        <div className="create-login-modal">
        <div className="create-login">
            <button onClick={onClose} className="close-button">X</button>
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
            <button type="submit">Login</button>
            </form>
            {responseMessage && <p style={{ color: responseMessage.startsWith('Success') ? 'green' : 'red', marginTop: '11px', fontSize: '30px',textAlign: 'center' }}>{responseMessage}</p>}
        </div>
        </div>
        
    );}

export default Signin;