const accessibilityOptions = [
  { title: 'High Contrast Mode', description: 'Increase the visual difference between text, controls, and background.' },
  { title: 'Reduce Motion', description: 'Minimize animations and smooth scrolling throughout the application.' },
  { title: 'Enhanced keyboard focus', description: 'Show a stronger focus outline when navigation with a keyboard.' },
  { title: 'Screen-reader announcements', description: 'Provide additional spoken confirmation when accessibility settings change.' },
];

export default function AccessibilityPage() {
  return (
    <div className="page-view">
      <h1 className="page-title" style={{ marginBottom: '20px' }}>Settings and Accesibility</h1>

      <div className="settings-grid">
        <div className="card settings-sidebar-card">
          <button className="settings-nav-item">My Details</button>
          <button className="settings-nav-item">Profile</button>
          <button className="settings-nav-item">Password</button>
          <button className="settings-nav-item">Team</button>
          <button className="settings-nav-item">Notification</button>
          <button className="settings-nav-item active">Accessibility</button>
        </div>

        <div className="card settings-content-card">
          <h2 className="settings-heading">Accessibility</h2>
          {accessibilityOptions.map((option) => (
            <div key={option.title} className="toggle-row">
              <div>
                <strong>{option.title}</strong>
                <p className="stat-sub">{option.description}</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked={option.title === 'High Contrast Mode'} />
                <span className="slider round"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
