/**
 * ----------------------------------------
 * Switch
 * ----------------------------------------
 * A versatile toggle component with multiple variants.
 */
export default function Switch({ 
  id, 
  name, 
  checked, 
  onChange, 
  label,
  offLabel = 'Off',
  onLabel = 'On',
  variant = 'toggle', // 'toggle' or 'segmented'
  disabled = false,
  className = ''
}) {
  const isChecked = checked === '1' || checked === true;

  const handleChange = (e) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: e.target.checked ? '1' : '0',
          type: 'checkbox',
          checked: e.target.checked
        }
      });
    }
  };

  if (variant === 'segmented') {
    return (
      <div className={`relative ${className}`}>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            id={id}
            name={name}
            type="checkbox" 
            className="sr-only" 
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
          />
          <div className="flex items-center bg-sage-100 rounded-full p-1 min-w-[200px] h-14 relative transition-all duration-300">
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-teal-600 rounded-full shadow-lg shadow-teal-900/20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isChecked ? 'translate-x-[100%]' : 'translate-x-0'
              }`}
            />
            
            {/* Labels */}
            <div className="relative flex w-full z-10 font-semibold text-sm">
              <span className={`flex-1 text-center transition-colors duration-300 ${!isChecked ? 'text-white' : 'text-sage-400'}`}>
                {offLabel}
              </span>
              <span className={`flex-1 text-center transition-colors duration-300 ${isChecked ? 'text-white' : 'text-sage-400'}`}>
                {onLabel}
              </span>
            </div>
          </div>
        </label>
      </div>
    );
  }

  // Default 'toggle' variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="relative inline-flex items-center cursor-pointer group">
        <input 
          id={id}
          name={name}
          type="checkbox" 
          className="sr-only peer" 
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-sage-200 outline-none peer-focus:ring-4 peer-focus:ring-mint-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-sage-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 transition-colors"></div>
        {label && (
          <span className="ms-3 text-sm font-semibold text-sage-500 group-hover:text-teal-600 transition-colors">
            {label}
          </span>
        )}
      </label>
    </div>
  );
}
