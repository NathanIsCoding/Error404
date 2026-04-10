import { useState } from 'react';
import './EditProfile.css';

export default function EditProfile({ user, profile, onClose, onSaved }) {
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*.,?+-]).{8,}$/;
    if (newPassword && !passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, contain at least one capital letter, and one special symbol.');
      return;
    }
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      if (email.trim()) formData.append('email', email.trim());
      formData.append('currentPassword', currentPassword);
      if (newPassword) {
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);
      }
      if (photoFile) formData.append('profilePhoto', photoFile);

      const res = await fetch('/api/accounts/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }
      onSaved(data.user);
    } catch {
      setError('Unable to connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
        <h3 className="edit-profile-title">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="edit-profile-form">

          <div className="edit-profile-photo-section">
            <img
              src={photoPreview || `/api/accounts/${profile.userId}/photo`}
              alt="Profile"
              className="edit-profile-photo-preview"
            />
            <label className="edit-profile-photo-label">
              Change Photo
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoChange}
                className="edit-profile-photo-input"
              />
            </label>
          </div>

          <label className="edit-profile-label">Username</label>
          <input
            className="edit-profile-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <label className="edit-profile-label">New Email <span className="edit-profile-optional">(leave blank to keep current)</span></label>
          <input
            className="edit-profile-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter new email"
          />

          <label className="edit-profile-label">Current Password <span className="edit-profile-required">*</span></label>
          <input
            className="edit-profile-input"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            placeholder="Required to save changes"
          />

          <label className="edit-profile-label">New Password <span className="edit-profile-optional">(leave blank to keep current)</span></label>
          <input
            className="edit-profile-input"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <label className="edit-profile-label">Confirm New Password</label>
          <input
            className="edit-profile-input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />

          {error && <p className="edit-profile-error">{error}</p>}

          <div className="edit-profile-actions">
            <button type="button" className="edit-profile-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="edit-profile-save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
