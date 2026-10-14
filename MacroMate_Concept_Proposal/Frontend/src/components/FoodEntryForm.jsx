import { useEffect, useRef, useState } from 'react';

export default function FoodEntryForm({ date, busy, onSave, onClose }) {
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    formRef.current.querySelector('input').focus();
    return () => previousFocus?.focus();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const foodName = data.get('foodName').trim();
    if (!foodName) {
      setError('Enter a food name.');
      return;
    }
    setError('');
    try {
      await onSave({
        foodName, meal: data.get('meal'), entryDate: data.get('entryDate'),
        calories: Number(data.get('calories')), protein: Number(data.get('protein')),
        carbs: Number(data.get('carbs')), fat: Number(data.get('fat')),
      });
      onClose();
    } catch (err) {
      setError(`Entry was not saved. ${err.message}`);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key === 'Tab') {
      const controls = [...formRef.current.querySelectorAll('input, select, button')].filter((el) => !el.disabled);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  return (
    <div className="modal-backdrop" onClick={() => { if (!busy) onClose(); }}>
      <form ref={formRef} className="modal-content" role="dialog" aria-modal="true" aria-labelledby="food-form-title"
        onClick={(event) => event.stopPropagation()} onKeyDown={handleKeyDown} onSubmit={submit}>
        <div className="modal-header">
          <h3 id="food-form-title">Log Food Item</h3>
          <button type="button" className="close-btn" aria-label="Close food form" disabled={busy} onClick={onClose}>✕</button>
        </div>
        <fieldset disabled={busy} className="food-form-fields">
          <label>Food name<input name="foodName" type="text" required maxLength="120" className="grey-input" /></label>
          <label>Meal<select name="meal" aria-label="Meal" className="grey-input" defaultValue="Breakfast">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => <option key={meal}>{meal}</option>)}
          </select></label>
          <label>Date<input name="entryDate" type="date" defaultValue={date} required className="grey-input" /></label>
          <label>Calories (kcal)<input name="calories" type="number" required min="0" max="1000000" step="1" className="grey-input" /></label>
          {['protein', 'carbs', 'fat'].map((name) => (
            <label key={name}>{name.charAt(0).toUpperCase() + name.slice(1)} (g)
              <input name={name} type="number" required min="0" max="100000" step="0.1" className="grey-input" />
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="journal-error">{error}</p>}
        <button type="submit" disabled={busy} className="primary-green-btn">{busy ? 'Saving…' : 'Add Entry'}</button>
      </form>
    </div>
  );
}
