export default function HealthJournalPage({ mood, onMoodChange, waterGlasses, onWaterGlassesChange }) {
  return (
    <div className="page-view">
      <div className="page-header-block">
        <span className="sub-heading">Whole-person-wellness</span>
        <div className="page-title-row">
          <h1 className="page-title">Health Journal</h1>
          <div className="date-badge">
            <span>📅</span> Saturday, October 03
          </div>
        </div>
        <p className="page-description">Notice how your daily habits shape the way you feel.</p>
      </div>

      <div className="health-grid-top">
        <div className="card checkin-card">
          <h2>Today's check-in</h2>
          <p className="card-subtext">A quick reflection takes less than a minute</p>

          <div className="mood-selector">
            {['Low', 'Okay', 'Good', 'Great'].map((option) => (
              <button
                key={option}
                className={`mood-btn ${mood === option ? 'selected' : ''}`}
                onClick={() => onMoodChange(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mood-slider-bar">
            <div className="slider-fill" style={{ width: mood === 'Good' ? '70%' : '50%' }}></div>
          </div>
          <div className="slider-labels">
            <span>Drained</span>
            <span>Energized</span>
          </div>

          <div className="checkin-metrics">
            <div className="metric-box">
              <div className="metric-header">🌙 Sleep</div>
              <div className="time-select-group">
                <select defaultValue="6" className="metric-select">
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((hours) => (
                    <option key={hours} value={hours}>{hours} {hours === 1 ? 'hr' : 'hrs'}</option>
                  ))}
                </select>
                <select defaultValue="30" className="metric-select">
                  {Array.from({ length: 60 }, (_, minutes) => (
                    <option key={minutes} value={minutes}>{minutes.toString().padStart(2, '0')} mins</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-header">💧 Water</div>
              <div className="water-counter">
                <button onClick={() => onWaterGlassesChange(Math.max(0, waterGlasses - 1))}>-</button>
                <span>{waterGlasses} Glasses</span>
                <button onClick={() => onWaterGlassesChange(waterGlasses + 1)}>+</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card snapshot-card">
          <span className="snapshot-tag">LATEST SNAPSHOT</span>
          <div className="snapshot-main">
            <div>
              <h2 className="snapshot-value">{mood}</h2>
              <p className="snapshot-sub">Overall Mood</p>
            </div>
            <div className="heart-circle">💚</div>
          </div>

          <div className="snapshot-stats">
            <div className="snap-box"><div className="snap-num">4/5</div><div className="snap-lbl">Energy</div></div>
            <div className="snap-box"><div className="snap-num">7.5 h</div><div className="snap-lbl">Sleep</div></div>
            <div className="snap-box"><div className="snap-num">{waterGlasses}</div><div className="snap-lbl">Water</div></div>
          </div>
        </div>
      </div>

      <div className="health-grid-bottom">
        <div className="card mood-history-card">
          <h2 className="section-title-center">MOOD</h2>
          <div className="timeframe-tabs">
            <button>Week</button><button className="active">Month</button><button>Year</button>
          </div>
          <div className="month-tabs">
            <button>January</button><button>February</button><button className="active">March</button><button>April</button>
          </div>
          <div className="dots-grid">
            {Array.from({ length: 28 }).map((_, index) => (
              <div key={index} className={`mood-dot ${index === 6 ? 'neutral' : ''}`}>
                {index === 6 ? '😐' : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="card avg-mood-card">
          <h2 className="avg-title">Average Mood</h2>
          <p className="avg-sub">Your average mood by day</p>
          <div className="days-header">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>
          <div className="calendar-grid">
            {Array.from({ length: 26 }).map((_, index) => (
              <div
                key={index}
                className={`calendar-day-dot ${[2, 8, 15].includes(index) ? 'green-face' : [3, 9, 14].includes(index) ? 'yellow-face' : ''}`}
              >
                {[2, 8, 15].includes(index) ? '😐' : [3, 9, 14].includes(index) ? '😄' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
