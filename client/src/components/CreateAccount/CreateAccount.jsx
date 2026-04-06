import React, { useState } from 'react';
import './CreateAccount.css';

const CreateAccount = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };



  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (password !== verifyPassword) {
      setPasswordInvalid(true);
      return;
    }
    setPasswordInvalid(false);
    // server will stamp the creation time in UTC−07:00, so we don't
    // send our own timestamp here; keep the payload as small as possible
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setResponseMessage(`Success: ${data.message}`);
        if (onSuccess) {
          const me = await fetch('/api/accounts/me', { credentials: 'include' });
          const userData = await me.json();
          onSuccess(userData);
        }
        onClose();
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
        <button onClick={onClose} className="close-button click-button">X</button>
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
          <label htmlFor="verifyPassword">Verify Password:</label>
          <input
            type="password"
            id="verifyPassword"
            name="verifyPassword"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
          {passwordInvalid && (
            <div className='flex text-red-600 text-bold'>
              <span className="material-symbols-outlined mr-1">skull</span>
              Invalid Password
            </div>
          )}

          <br />
          <label htmlFor="profilePhoto">Profile Photo (optional):</label>
          <div className="photo-upload-area">
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            )}
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoChange}
            />
          </div>
          <br />
          <button>Create Account</button>
        </form>
        {responseMessage && <p style={{ color: responseMessage.startsWith('Success') ? 'green' : 'red', marginTop: '11px', fontSize: '30px',textAlign: 'center' }}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default CreateAccount;