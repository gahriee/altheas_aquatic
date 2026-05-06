import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

const TooltipContext = createContext(null);

/**
 * ----------------------------------------
 * TooltipProvider
 * ----------------------------------------
 * Manages global tooltip state and renders tooltips via a high-level Portal.
 */
export function TooltipProvider({ children }) {
  const [active, setActive] = useState(false);
  const location = useLocation();
  const [tooltip, setTooltip] = useState({
    text: '',
    x: 0,
    y: 0,
    position: 'top',
  });

  const showTooltip = useCallback((text, rect, position = 'top') => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = centerX;
    let y = centerY;

    if (position === 'top') y = rect.top - 8;
    else if (position === 'bottom') y = rect.bottom + 8;
    else if (position === 'left') x = rect.left - 8;
    else if (position === 'right') x = rect.right + 8;

    setTooltip({ text, x, y, position });
    setActive(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setActive(false);
  }, []);

  // Clear tooltip on navigation
  useEffect(() => {
    hideTooltip();
  }, [location.pathname, hideTooltip]);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {createPortal(
        <GlobalTooltip tooltip={tooltip} active={active} />,
        document.body
      )}
    </TooltipContext.Provider>
  );
}

function GlobalTooltip({ tooltip, active }) {
  const { text, x, y, position } = tooltip;

  const positions = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2 translate-y-0',
    left: '-translate-x-full -translate-y-1/2',
    right: 'translate-x-0 -translate-y-1/2',
  };

  const arrows = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t',
    left: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-r border-t',
    right: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-b',
  };

  return (
    <div 
      className={`
        fixed z-[9999] px-3 py-1.5 
        bg-teal-600/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest
        rounded-lg pointer-events-none whitespace-nowrap
        shadow-xl shadow-teal-600/20 border border-white/5
        transition-all duration-200 ease-out
        ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${positions[position]}
      `}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {text}
      <div className={`absolute w-2 h-2 bg-teal-600/95 rotate-45 border-white/5 ${arrows[position]}`} />
    </div>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('useTooltip must be used within a TooltipProvider');
  return context;
}
