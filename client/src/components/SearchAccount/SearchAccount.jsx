import React, { useState } from 'react';
import '../CreateAccount/CreateAccount.css';

const SearchAccount = ({ onClose }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(username);
    setUsername('');
  };

  return (
    <div className="create-account-modal">
      <div className="create-account">
        <button onClick={onClose} className="close-button">X</button>
        <h1>Search Accounts</h1>
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
          <button type="submit">Search</button>
        </form>
      </div>
    </div>
  );
};

export default SearchAccount;
