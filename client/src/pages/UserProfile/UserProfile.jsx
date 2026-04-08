import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import EditProfile from '../../components/EditProfile/EditProfile';
import './UserProfile.css';

export default function UserProfile({ user, setUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeDraft, setResumeDraft] = useState('');
  const [resumeSaving, setResumeSaving] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const isOwner = user && profile && user.username.toLowerCase() === profile.username.toLowerCase();

  useEffect(() => {
    fetch(`/api/accounts/profile/${encodeURIComponent(username)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setProfile(data);
        if (data) setResumeDraft(data.resumeText || '');
      })
      .catch(() => {});
  }, [username]);

  const handleProfileSaved = (updatedUser) => {
    setUser(updatedUser);
    setShowEditProfile(false);
    if (updatedUser.username.toLowerCase() !== username.toLowerCase()) {
      navigate(`/user/${encodeURIComponent(updatedUser.username)}`, { replace: true });
    } else {
      setProfile(prev => ({ ...prev, username: updatedUser.username }));
      setPhotoError(false);
    }
  };

  const handleOpenEditor = () => {
    setResumeDraft(profile.resumeText || '');
    setShowResumeEditor(true);
  };

  const handleSaveResume = async () => {
    setResumeSaving(true);
    try {
      const res = await fetch('/api/accounts/profile/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeDraft })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, resumeText: data.resumeText }));
        setShowResumeEditor(false);
      }
    } catch {
      // ignore
    } finally {
      setResumeSaving(false);
    }
  };

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

          {profile.resumeText && (
            <div className="profile-resume-section">
              <h3 className="profile-resume-heading">Resume</h3>
              <p className="profile-resume-text">{profile.resumeText}</p>
            </div>
          )}

          {isOwner && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="resume-btn" onClick={handleOpenEditor}>
                {profile.resumeText ? 'Edit Resume' : 'Add Resume'}
              </button>
              <button className="resume-btn" onClick={() => setShowEditProfile(true)}>
                Edit Profile
              </button>
            </div>
          )}

          {showEditProfile && (
            <EditProfile
              user={user}
              profile={profile}
              onClose={() => setShowEditProfile(false)}
              onSaved={handleProfileSaved}
            />
          )}

          {showResumeEditor && (
            <div className="resume-modal-overlay" onClick={() => setShowResumeEditor(false)}>
              <div className="resume-modal" onClick={e => e.stopPropagation()}>
                <h3 className="resume-modal-title">
                  {profile.resumeText ? 'Edit Resume' : 'Add Resume'}
                </h3>
                <textarea
                  className="resume-textarea"
                  value={resumeDraft}
                  onChange={e => setResumeDraft(e.target.value)}
                  placeholder="Paste or type your resume here..."
                  rows={14}
                />
                <div className="resume-modal-actions">
                  <button className="resume-cancel-btn" onClick={() => setShowResumeEditor(false)}>
                    Cancel
                  </button>
                  <button className="resume-save-btn" onClick={handleSaveResume} disabled={resumeSaving}>
                    {resumeSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '4rem' }}>Loading profile...</p>
      )}
    </div>
  );
}
