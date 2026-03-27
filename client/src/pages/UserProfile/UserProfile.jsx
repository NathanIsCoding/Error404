import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './UserProfile.css';

export default function UserProfile({ user, setUser }) {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    fetch(`/api/accounts/profile/${encodeURIComponent(username)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setProfile(data))
      .catch(() => {});
  }, [username]);

  return (
    <div className="profile-page">
      <Navbar user={user} setUser={setUser} />

      {profile ? (
        <div className="profile-card">
          {!photoError ? (
            <img
              src={`/api/accounts/${profile.userId}/photo`}
              alt={profile.username}
              className="profile-photo"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <div className="profile-photo-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="profile-username">{profile.username}</div>
          <div className="profile-joined">
            Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '4rem' }}>Loading profile...</p>
      )}
    </div>
  );
}
