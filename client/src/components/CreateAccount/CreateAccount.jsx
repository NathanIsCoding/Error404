import React, { useState } from 'react';
import './CreateAccount.css';

const CreateAccount = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const account = { username, email, password };
    try {
      const response = await fetch('http://localhost:3000/api/accounts', {
        method: 'POST',
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
    <div className="create-account-modal">
      <div className="create-account">
        <button onClick={onClose} className="close-button">X</button>
        <h1>Create Account</h1>
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
          <br />
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <button type="submit">Create Account</button>
        </form>
        {responseMessage && <p style={{ color: responseMessage.startsWith('Success') ? 'green' : 'red', marginTop: '11px', fontSize: '30px',textAlign: 'center' }}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default CreateAccount;