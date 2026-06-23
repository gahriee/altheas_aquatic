import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * ----------------------------------------
 * Select
 * ----------------------------------------
 * A high-fidelity custom dropdown component with aquatic styling.
 */
export default function Select({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  _label,
  id,
  name,
  _required = false,
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value?.toString() === value?.toString());

  const handleSelect = (optionValue) => {
    // Mimic standard event for internal state handlers
    onChange({
      target: {
        name,
        value: optionValue
      }
    });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-5 py-3.5 border border-sage-100 rounded-2xl shadow-sm text-left transition-all outline-none focus:ring-2 focus:ring-mint-300 focus:border-mint-300 focus:bg-white ${
          isOpen ? 'ring-2 ring-mint-300 bg-white border-mint-100 shadow-lg shadow-teal-500/5' : 'bg-sage-50'
        } ${className}`}
      >
        <span className={`${!selectedOption ? 'text-sage-300' : 'text-sage-700'} font-medium whitespace-nowrap truncate mr-2`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-sage-300 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} 
        />
      </button>

      {/* Options Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-sage-100 rounded-2xl shadow-xl shadow-teal-500/10 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top">
          <div className="max-h-60 overflow-y-auto py-2">
            {options.map((option, index) => (
              <button
                key={option.value || `${option.label}-${index}`}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-5 py-3 text-left transition-colors flex items-center justify-between group ${
                  option.value?.toString() === value?.toString() 
                    ? 'bg-teal-50 text-teal-700 font-semibold' 
                    : 'text-sage-500 hover:bg-sage-50 hover:text-teal-600'
                }`}
              >
                <span>{option.label}</span>
                {option.value?.toString() === value?.toString() && (
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                )}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-5 py-3 text-sage-300 italic text-sm text-center">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
