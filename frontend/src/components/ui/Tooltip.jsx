import { useRef } from 'react';
import { useTooltip } from '../../context/TooltipContext';

/**
 * ----------------------------------------
 * Tooltip
 * ----------------------------------------
 * A lightweight trigger for global tooltips.
 * Decouples tooltip rendering from the local DOM by using a Global Context.
 */
export default function Tooltip({ text, children, position = 'top', className = "inline-flex items-center justify-center", disabled = false }) {
  const { showTooltip, hideTooltip } = useTooltip();
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      showTooltip(text, rect, position);
    }
  };

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={hideTooltip}
      onClick={hideTooltip}
      className={className}
    >
      {children}
    </div>
  );
}
