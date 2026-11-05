export function TextField({ label, name, value, onChange, type = 'text', disabled = false, placeholder = '' }) {
  return (
    <div className="mm-form-field-item">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        className="mm-profile-input-styled"
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

export function NumberField(props) {
  return <TextField {...props} type="number" />;
}

export function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="mm-form-field-item">
      <label htmlFor={name}>{label}</label>
      <select id={name} className="mm-profile-input-styled" name={name} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export function ToggleField({ label, name, checked, onChange }) {
  return (
    <label htmlFor={name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, marginBottom: 18 }}>
      <input id={name} type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}