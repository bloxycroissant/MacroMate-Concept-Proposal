export default function ProfilePage() {
  return (
    <div className="page-view">
      <span className="sub-heading">Manage your personal wellness details</span>
      <h1 className="page-title">My Profile</h1>

      <div className="profile-grid">
        <div className="profile-left-col">
          <div className="card profile-badge-card">
            <div className="avatar-circle">AL<span className="cam-icon">📷</span></div>
            <h2>Aaron Layman</h2>
            <span className="stat-sub">Wellness Member</span>
            <div className="complete-pill">Profile Complete</div>
          </div>

          <div className="card goal-highlight-card">
            <div className="heart-icon-badge">🤍</div>
            <h3>Your Wellness Goal</h3>
            <p className="stat-sub">Maintain a balanced lifestyle</p>
          </div>
        </div>

        <div className="card profile-form-card">
          <h3>Personal Information</h3>
          <p className="stat-sub">Used to personalize your nutrition and wellness targets.</p>

          <div className="form-group">
            <label>FULL NAME</label>
            <input type="text" defaultValue="Aaron Layman" className="grey-input" />
          </div>
          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input type="email" defaultValue="aaronlayman@gmail.com" className="grey-input" />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>AGE</label>
              <input type="text" defaultValue="23" className="grey-input" />
            </div>
            <div className="form-group">
              <label>HEIGHT</label>
              <input type="text" defaultValue="154cm" className="grey-input" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>WEIGHT (KG)</label>
              <input type="text" defaultValue="51" className="grey-input" />
            </div>
            <div className="form-group">
              <label>ACTIVITY LEVEL</label>
              <select defaultValue="Moderately Active" className="grey-input">
                <option>Moderately Active</option>
                <option>Very Active</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>PRIMARY WELLNESS GOAL</label>
            <input type="text" defaultValue="Maintain a balanced lifestyle" className="grey-input" />
          </div>

          <div className="reminders-banner">
            <strong>Daily Reminders</strong>
            <p className="stat-sub">Receive gentle prompts to log meals and wellness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
