const InputSimple = ({
    id,
    name,
    value,
    placeholder,
    type = 'text',
    disabled = false,
    onChange,
    required = false,
}) => {
    const containerStyle = {
      display: 'flex',
      gridGap: '10px',
      width: '100%',
      borderRadius: '5px',
      border: '1px solid rgba(0, 0, 0, 0.2)',
    };
  
    const inputStyle = {
      width: '100%',
      fontSize: '16px',
      fontFamily: 'Inter',
      fontWeight: 300,
      color: 'rgba(0, 0, 0, 0.7)',
      outline: 'none',
      border: 'none',
      borderRadius: '5px',
      padding: '10px',
    };
  
    return (
      <div className="input_simple" style={containerStyle}>
        <input
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
          onChange={onChange}
          required={required}
          style={inputStyle}
        />
      </div>
    );
};
  
export default InputSimple;