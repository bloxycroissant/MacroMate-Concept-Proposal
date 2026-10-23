const options = [
  ['highContrast', 'High Contrast Mode', 'Use a strong light-on-dark theme.'],
  ['reduceMotion', 'Reduce Motion', 'Reduce animations and transitions.'],
  ['enhancedFocus', 'Enhanced keyboard focus', 'Show a stronger outline on focused controls.'],
  ['announcements', 'Screen-reader announcements', 'Announce cloud save status.'],
];
export default function AccessibilityPage({ preferences, onChange, busy }) {
  return <div className="page-view"><h1 className="page-title">Accessibility</h1>
    <div className="card settings-content-card">{options.map(([key, title, description]) => <div key={key} className="toggle-row">
      <div><strong>{title}</strong><p className="stat-sub">{description}</p></div>
      <label className="switch"><input type="checkbox" aria-label={title} checked={preferences[key]} disabled={busy} onChange={(event) => onChange(key, event.target.checked)} /><span className="slider round" /></label>
    </div>)}</div>
  </div>;
}
