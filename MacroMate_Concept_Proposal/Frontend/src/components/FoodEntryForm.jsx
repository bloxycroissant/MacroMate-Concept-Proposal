import { useEffect, useRef, useState } from 'react';
import foodCatalog from './foodCatalog';

export default function FoodEntryForm({ date, busy, onSave, onClose }) {
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [meal, setMeal] = useState('Breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const formRef = useRef(null);
  const selectedFood = foodCatalog.find((food) => food.id === selectedFoodId);
  const visibleFoods = foodCatalog.filter((food) => (
    `${food.name} ${food.serving}`.toLowerCase().includes(search.trim().toLowerCase())
  ));

  useEffect(() => {
    const previousFocus = document.activeElement;
    formRef.current.querySelector('input').focus();
    return () => previousFocus?.focus();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const submittedFoodName = data.get('foodName').trim();
    if (!submittedFoodName) {
      setError('Enter a food name.');
      return;
    }
    setError('');
    try {
      await onSave({
        foodName: submittedFoodName, meal: data.get('meal'), entryDate: data.get('entryDate'),
        calories: Number(data.get('calories')), protein: Number(data.get('protein')),
        carbs: Number(data.get('carbs')), fat: Number(data.get('fat')),
      });
      onClose();
    } catch (err) {
      setError(`Entry was not saved. ${err.message}`);
    }
  }

  function chooseFood(foodId) {
    const food = foodCatalog.find((item) => item.id === foodId);
    if (!food) {
      setSelectedFoodId(null);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      return;
    }

    setSelectedFoodId(food.id);
    setFoodName(`${food.name} (${food.serving} g)`);
    setCalories(String(food.calories));
    setProtein(String(food.protein));
    setCarbs(String(food.carbs));
    setFat(String(food.fat));
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key === 'Enter' && event.target.id === 'food-search') event.preventDefault();
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
          <label htmlFor="food-search">Choose a food</label>
          <input
            id="food-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search foods..."
            className="grey-input"
          />
          <div className="food-catalog-list" role="group" aria-label="Available foods">
            {visibleFoods.length === 0 && <p className="food-catalog-empty">No foods match your search.</p>}
            {visibleFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                className={`food-catalog-option${selectedFoodId === food.id ? ' selected' : ''}`}
                aria-pressed={selectedFoodId === food.id}
                onClick={() => chooseFood(food.id)}
              >
                <span className="food-catalog-option-heading">
                  <span>{food.name}</span>
                  <span className="food-catalog-serving">{food.serving} g</span>
                </span>
                <span className="food-catalog-nutrients">
                  {food.calories} kcal · P {food.protein} g · C {food.carbs} g · F {food.fat} g
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="food-catalog-manual" onClick={() => chooseFood(null)}>
            Enter food manually
          </button>
          {selectedFood && (
            <p className="food-catalog-note" role="status">
              Catalog values per {selectedFood.serving} g serving: {selectedFood.calories} kcal,
              {' '}{selectedFood.protein} g protein, {selectedFood.carbs} g carbs, and {selectedFood.fat} g fat.
              Values can be edited before adding.
            </p>
          )}
          <label>Food name<input name="foodName" type="text" required maxLength="120" className="grey-input" value={foodName} onChange={(event) => setFoodName(event.target.value)} /></label>
          <label>Meal<select name="meal" aria-label="Meal" className="grey-input" value={meal} onChange={(event) => setMeal(event.target.value)}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealName) => <option key={mealName}>{mealName}</option>)}
          </select></label>
          <label>Date<input name="entryDate" type="date" defaultValue={date} required className="grey-input" /></label>
          <label>Calories (kcal)<input name="calories" type="number" required min="0" max="1000000" step="1" className="grey-input" value={calories} onChange={(event) => setCalories(event.target.value)} /></label>
          {['protein', 'carbs', 'fat'].map((name) => (
            <label key={name}>{name.charAt(0).toUpperCase() + name.slice(1)} (g)
              <input
                name={name}
                type="number"
                required
                min="0"
                max="100000"
                step="0.1"
                className="grey-input"
                value={{ protein, carbs, fat }[name]}
                onChange={(event) => ({ protein: setProtein, carbs: setCarbs, fat: setFat })[name](event.target.value)}
              />
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="journal-error">{error}</p>}
        <button type="submit" disabled={busy} className="primary-green-btn">{busy ? 'Saving…' : 'Add Entry'}</button>
      </form>
    </div>
  );
}
