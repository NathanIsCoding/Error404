import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Paginator from '../../components/Paginator/Paginator';
import EditProfile from '../../components/EditProfile/EditProfile';
import CreateTicket from '../../components/CreateTicket/CreateTicket';
import './UserProfile.css';

const COMMENTS_PER_PAGE = 5;

export default function UserProfile({ user, setUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeDraft, setResumeDraft] = useState('');
  const [resumeSaving, setResumeSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentError, setCommentError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReport, setShowReport] = useState(false);

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

  useEffect(() => {
    fetch(`/api/accounts/profile/${encodeURIComponent(username)}/comments`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { setComments(data); setCommentsPage(0); })
      .catch(() => {});
  }, [username]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    setCommentError('');
    try {
      const res = await fetch(`/api/accounts/profile/${encodeURIComponent(username)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: commentText.trim(), rating: commentRating || null })
      });
      if (!res.ok) {
        const data = await res.json();
        setCommentError(data.error || 'Failed to post comment');
        return;
      }
      const newComment = await res.json();
      setComments(prev => [newComment, ...prev]);
      setCommentsPage(0);
      setCommentText('');
      setCommentRating(0);
      if (commentRating) refreshRating();
    } catch {
      setCommentError('Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleCommentDelete(commentId) {
    const comment = comments.find(c => c._id === commentId);
    try {
      const res = await fetch(`/api/accounts/profile/${encodeURIComponent(username)}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        if (comment?.rating) refreshRating();
      }
    } catch {
      // ignore
    }
  }

  function refreshRating() {
    fetch(`/api/accounts/profile/${encodeURIComponent(username)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setProfile(prev => ({ ...prev, rating: data.rating })); })
      .catch(() => {});
  }

  function StarDisplay({ value, size = '20px' }) {
    return (
      <span className="star-display">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="material-symbols-outlined" style={{ fontSize: size, color: i <= Math.round(value) ? '#facc15' : '#444' }}>
            {i <= Math.round(value) ? 'star' : 'star_border'}
          </span>
        ))}
      </span>
    );
  }

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
          
          {user && !isOwner && (
            <button
              className="report-btn"
              onClick={() => setShowReport(true)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem'
              }}
              title="Report User"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>flag</span>
              Report User
            </button>
          )}

          <div className="profile-rating">
            <StarDisplay value={profile.rating ?? 0} size="22px" />
            <span className="profile-rating-value">
              {profile.rating > 0 ? profile.rating.toFixed(1) : 'No ratings yet'}
            </span>
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

          {showReport && (
            <CreateTicket
              onClose={() => setShowReport(false)}
              initialTitle={`[Report User] ${profile.username}`}
              initialDescription={`Reported User ID: ${profile.userId}\n\nPlease specify why you are reporting this user:`}
            />
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

      {profile && (
        <div className="comments-section">
          <h3 className="comments-heading">Comments</h3>

          {user && !isOwner ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className="material-symbols-outlined star-picker-star"
                    style={{ color: i <= (hoverRating || commentRating) ? '#facc15' : '#555' }}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setCommentRating(prev => prev === i ? 0 : i)}
                  >
                    {i <= (hoverRating || commentRating) ? 'star' : 'star_border'}
                  </span>
                ))}
                {commentRating > 0 && (
                  <span className="star-picker-label">{commentRating}/5</span>
                )}
              </div>
              <textarea
                className="comment-textarea"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
                maxLength={1000}
              />
              <div className="comment-form-footer">
                {commentError && <span className="comment-error">{commentError}</span>}
                <button className="comment-submit-btn" type="submit" disabled={commentSubmitting || !commentText.trim()}>
                  {commentSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          ) : !isOwner && (
            <p className="comment-sign-in">Sign in to leave a comment.</p>
          )}

          <div className="comments-list">
            {comments.length === 0 && (
              <p className="comments-empty">No comments yet.</p>
            )}
            {comments.slice(commentsPage * COMMENTS_PER_PAGE, (commentsPage + 1) * COMMENTS_PER_PAGE).map(comment => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <Link to={`/user/${comment.authorUsername}`} className="comment-author">
                    {comment.authorUsername}
                  </Link>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {(user?.username?.toLowerCase() === comment.authorUsername.toLowerCase() || user?.isAdmin) && (
                    <button className="comment-delete-btn" onClick={() => handleCommentDelete(comment._id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
                {comment.rating && <StarDisplay value={comment.rating} size="16px" />}
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
          {comments.length > COMMENTS_PER_PAGE && (
            <Paginator
              currentPage={commentsPage}
              totalPages={Math.ceil(comments.length / COMMENTS_PER_PAGE)}
              onPageChange={setCommentsPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
