import React, { useState } from 'react';
import './SignIn.css';

const SignIn=({onClose})=> {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
      
      
      
      e.preventDefault();
      
      
      const account = { username, password };
      try {
        // Send a GET request to the backend
        const response = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(username)}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
          if(username==data.account){
            if(password==data.account){
              return('Logged In')
            }else{
              setErrorMessage(data.error || 'Password incorrect')
            }

          }else{
            setErrorMessage(data.error || 'Username incorrect')
          }
        } else {
          setErrorMessage(data.error || 'Account not found');
        }
      } catch (error) {
        console.error('Error fetching account:', error);
        setErrorMessage('Unable to connect to server');
      }

    };

  /*const validate = accounts.find((account) => {
    if (isusernameLookup) {
      return typeof account.username === 'string' &&
          account.email.trim().toLowerCase() === normalizedLookup;
    }

    return typeof account.password === 'string' &&
      account.username.trim().toLowerCase() === normalizedLookup;
  });*/

  



    return (
        
        <div className="login-modal">
        <div className="login">
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
            {responseMessage &&  
            <p 
              style={{ 
                color: responseMessage.startsWith('Success') ? 'green' : 'red',
                marginTop: '11px', 
                fontSize: '30px',
                textAlign: 'center'
                 }}
                 >
                 {responseMessage}
                 </p>}

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
        
    );}

export default SignIn;