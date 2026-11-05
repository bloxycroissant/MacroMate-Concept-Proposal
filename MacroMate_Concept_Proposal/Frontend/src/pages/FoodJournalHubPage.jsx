export default function FoodJournalHubPage({ onSelectDaily, onSelectOverall }) {
  return (
    <div className="page-view">
      <h1 className="giant-title">Food Journal Categories</h1>
      <div className="hub-categories-grid">
        <button type="button" className="hub-card crimson-hub" onClick={onSelectDaily}>
          <div className="hub-icons"><span>📅</span><span>🍴</span></div>
          <h2>Daily<br />Food Journal</h2>
          <p>Log today's Meals & Snacks</p>
        </button>
        <button type="button" className="hub-card gold-hub" onClick={onSelectOverall}>
          <div className="hub-icons"><span>📖</span><span>🍴</span></div>
          <h2>Overall<br />Food Journal</h2>
          <p>Review History & Track Progress</p>
        </button>
      </div>
    </div>
  );
}
