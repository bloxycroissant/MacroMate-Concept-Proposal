import { useState, useRef } from 'react';

export default function ProfilePage({ profile, email, onSave, busy }) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(profile?.pfpUrl || null);
  const fileInputRef = useRef(null);

  // Derive user initials if no profile picture is uploaded
  const getInitials = (name) => {
    if (!name) return 'MM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setMessage('Profile photo updated!');
    }
  };

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const data = {
      fullName: form.get('fullName').trim(),
      age: Number(form.get('age')),
      heightCm: Number(form.get('heightCm')),
      weightKg: Number(form.get('weightKg')),
      activityLevel: form.get('activityLevel'),
      wellnessGoal: form.get('wellnessGoal').trim(),
      pfpUrl: profileImage,
    };

    if (!data.fullName || !data.wellnessGoal) {
      setMessage('Please fill in your full name and wellness goal.');
      setSaving(false);
      return;
    }

    try {
      await onSave(data);
      setMessage('Profile saved successfully.');
    } catch {
      setMessage('Profile was not saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const currentName = profile?.fullName || 'Wellness User';
  const currentGoal = profile?.wellnessGoal || 'Maintain a balanced lifestyle';

  return (
    <div className="mm-profile-page-view">
      <style>{`
        .mm-profile-page-view {
          padding: 24px;
          color: #122b1c;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .mm-profile-header-group {
          margin-bottom: 24px;
        }

        .mm-profile-subtext {
          font-size: 0.88rem;
          color: #a3b8aa;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
        }

        .mm-profile-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0c2115;
          margin: 0;
          letter-spacing: -0.5px;
        }

        /* Main 2-Column Layout */
        .mm-profile-grid-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Left Side Profile Cards */
        .mm-left-profile-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .mm-avatar-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          border: 1px solid #e1eee4;
          text-align: center;
        }

        .mm-avatar-top-banner {
          background: #c3e2c9;
          height: 110px;
          position: relative;
        }

        .mm-avatar-circle-wrapper {
          position: relative;
          width: 110px;
          height: 110px;
          margin: -55px auto 0 auto;
        }

        .mm-avatar-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #8ebd97;
          border: 4px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 900;
          color: #2b5736;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .mm-btn-camera-upload {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #145a32;
          color: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }
        .mm-btn-camera-upload:hover {
          transform: scale(1.1);
          background: #0d3b1f;
        }

        .mm-avatar-details-body {
          padding: 16px 20px 24px 20px;
        }

        .mm-avatar-user-name {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0c2115;
          margin: 6px 0 2px 0;
        }

        .mm-avatar-user-role {
          font-size: 0.82rem;
          color: #839d8e;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .mm-status-pill {
          display: inline-block;
          padding: 8px 24px;
          background: #8fbc97;
          color: #ffffff;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 800;
        }

        /* Wellness Goal Box */
        .mm-wellness-goal-box {
          background: #c3e2c9;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #b3d7bb;
        }

        .mm-heart-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          color: #145a32;
          margin-bottom: 16px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .mm-goal-box-title {
          font-size: 1.2rem;
          font-weight: 900;
          color: #145a32;
          margin: 0 0 4px 0;
        }

        .mm-goal-box-desc {
          font-size: 0.85rem;
          color: #3b6649;
          font-weight: 700;
          margin: 0;
          line-height: 1.4;
        }

        /* Right Form Panel */
        .mm-profile-right-card {
          background: #f7fbf8;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #e1eee4;
        }

        .mm-section-head-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: #0c2115;
          margin: 0 0 2px 0;
        }

        .mm-section-head-sub {
          font-size: 0.82rem;
          color: #a3b8aa;
          font-weight: 700;
          margin-bottom: 24px;
          display: block;
        }

        .mm-form-field-item {
          margin-bottom: 18px;
        }

        .mm-form-field-item label {
          display: block;
          font-size: 0.75rem;
          font-weight: 900;
          color: #314d3b;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .mm-profile-input-styled {
          width: 100%;
          padding: 12px 18px;
          background: #e2ede4;
          border: 1px solid #d4e3d6;
          border-radius: 14px;
          font-size: 0.95rem;
          color: #122b1c;
          font-weight: 700;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .mm-profile-input-styled:focus {
          background: #ffffff;
          border-color: #145a32;
          box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.12);
        }

        .mm-profile-input-styled[readonly] {
          color: #728d7d;
          cursor: not-allowed;
        }

        .mm-form-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Daily Reminders Card */
        .mm-daily-reminders-banner {
          background: #c3e2c9;
          border-radius: 18px;
          padding: 20px 24px;
          margin-top: 28px;
        }

        .mm-daily-reminders-banner h4 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          font-weight: 900;
          color: #0c2115;
        }

        .mm-daily-reminders-banner p {
          margin: 0;
          font-size: 0.82rem;
          color: #3b6649;
          font-weight: 700;
        }

        .mm-btn-save-profile {
          margin-top: 24px;
          padding: 12px 32px;
          border-radius: 20px;
          background: #145a32;
          color: #ffffff;
          font-weight: 900;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(20, 90, 50, 0.2);
          transition: all 0.2s ease;
        }

        .mm-btn-save-profile:hover {
          background: #0d3b1f;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Header Banner */}
      <div className="mm-profile-header-group">
        <span className="mm-profile-subtext">Manage your personal wellness details</span>
        <h1 className="mm-profile-title">My Profile</h1>
      </div>

      {/* Main Grid Content */}
      <div className="mm-profile-grid-container">
        {/* Left Column: Avatar & Goal Card */}
        <div className="mm-left-profile-stack">
          <div className="mm-avatar-card">
            <div className="mm-avatar-top-banner" />
            
            <div className="mm-avatar-circle-wrapper">
              {profileImage ? (
                <img src={profileImage} alt={currentName} className="mm-avatar-circle" />
              ) : (
                <div className="mm-avatar-circle">
                  {getInitials(currentName)}
                </div>
              )}
              
              <button
                type="button"
                className="mm-btn-camera-upload"
                title="Change Profile Picture"
                onClick={() => fileInputRef.current?.click()}
              >
                📷
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div className="mm-avatar-details-body">
              <h2 className="mm-avatar-user-name">{currentName}</h2>
              <div className="mm-avatar-user-role">Wellness Member</div>
              <span className="mm-status-pill">Profile Complete</span>
            </div>
          </div>

          <div className="mm-wellness-goal-box">
            <div className="mm-heart-icon-circle">♡</div>
            <h3 className="mm-goal-box-title">Your Wellness Goal</h3>
            <p className="mm-goal-box-desc">{currentGoal}</p>
          </div>
        </div>

        {/* Right Column: Personal Information Form */}
        <div className="mm-profile-right-card">
          <h3 className="mm-section-head-title">Personal Information</h3>
          <span className="mm-section-head-sub">Used to personalize your nutrition and wellness targets.</span>

          <form onSubmit={submit}>
            <fieldset disabled={busy || saving} style={{ border: 'none', padding: 0, margin: 0 }}>
              <div className="mm-form-field-item">
                <label>Full Name</label>
                <input
                  name="fullName"
                  defaultValue={profile?.fullName || ''}
                  required
                  maxLength="120"
                  className="mm-profile-input-styled"
                />
              </div>

              <div className="mm-form-field-item">
                <label>Email Address</label>
                <input
                  value={email || 'local@demo.com'}
                  readOnly
                  className="mm-profile-input-styled"
                />
              </div>

              <div className="mm-form-row-2col">
                <div className="mm-form-field-item">
                  <label>Age</label>
                  <input
                    name="age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    step="1"
                    defaultValue={profile?.age || '23'}
                    className="mm-profile-input-styled"
                  />
                </div>

                <div className="mm-form-field-item">
                  <label>Height</label>
                  <input
                    name="heightCm"
                    type="number"
                    required
                    min="30"
                    max="300"
                    step="0.1"
                    defaultValue={profile?.heightCm || '154'}
                    className="mm-profile-input-styled"
                  />
                </div>
              </div>

              <div className="mm-form-row-2col">
                <div className="mm-form-field-item">
                  <label>Weight (KG)</label>
                  <input
                    name="weightKg"
                    type="number"
                    required
                    min="1"
                    max="700"
                    step="0.1"
                    defaultValue={profile?.weightKg || '51'}
                    className="mm-profile-input-styled"
                  />
                </div>

                <div className="mm-form-field-item">
                  <label>Activity Level</label>
                  <select
                    name="activityLevel"
                    aria-label="Activity level"
                    defaultValue={profile?.activityLevel || 'Moderately Active'}
                    className="mm-profile-input-styled"
                  >
                    <option>Sedentary</option>
                    <option>Lightly Active</option>
                    <option>Moderately Active</option>
                    <option>Very Active</option>
                  </select>
                </div>
              </div>

              <div className="mm-form-field-item">
                <label>Primary Wellness Goal</label>
                <input
                  name="wellnessGoal"
                  defaultValue={profile?.wellnessGoal || 'Maintain a balanced lifestyle'}
                  required
                  maxLength="300"
                  className="mm-profile-input-styled"
                />
              </div>

              <button type="submit" className="mm-btn-save-profile">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </fieldset>

            {message && (
              <p style={{ marginTop: '14px', fontSize: '0.85rem', color: '#145a32', fontWeight: 800 }}>
                {message}
              </p>
            )}
          </form>

          {/* Bottom Daily Reminders Banner */}
          <div className="mm-daily-reminders-banner">
            <h4>Daily Reminders</h4>
            <p>Receive gentle prompts to log meals and wellness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}