import React, { useState } from 'react';
import '../CreateAccount/CreateAccount.css';

const formatCreatedAt = (createdAt) => {
  if (!createdAt) {
    return 'Unknown';
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return parsedDate.toLocaleString();
};

const SearchAccount = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      setErrorMessage('Please enter a username or email');
      setSearchResult(null);
      return;
    }

    // Clear old messages/results before starting a new search
    setErrorMessage('');
    setSearchResult(null);

    try {
      // Send a GET request to the backend
      const response = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(trimmedSearchTerm)}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResult(data.account);
      } else {
        setErrorMessage(data.error || 'Account not found');
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      setErrorMessage('Unable to connect to server');
    }
    setSearchTerm('');
  };

  return (
    <div className="create-account-modal">
      <div className="create-account">
        <button onClick={onClose} className="close-button">X</button>

        <h1>Search Account</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="searchTerm">Username or Email:</label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />

          <br />
          <button type="submit">Search</button>
        </form>

        {searchResult && (
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '5px'
            }}
          >
            <p><strong>Username:</strong> {searchResult.username}</p>
            <p><strong>Email:</strong> {searchResult.email}</p>
            <p><strong>Created At:</strong> {formatCreatedAt(searchResult.createdAt)}</p>
          </div>
        )}

        {errorMessage && (
          <p
            style={{
              color: 'red',
              marginTop: '11px',
              fontSize: '16px',
              textAlign: 'center'
            }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchAccount;