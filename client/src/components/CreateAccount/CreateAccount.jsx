import React, { useState } from 'react';
import './CreateAccount.css';

const CreateAccount = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = { username, email, password };
    console.log('New account created:', JSON.stringify(account, null, 2));
    onClose();
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
      </div>
    </div>
  );
};

export default CreateAccount;