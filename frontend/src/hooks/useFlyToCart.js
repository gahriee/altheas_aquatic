import { useCallback } from 'react';

export function useFlyToCart() {
  /**
   * ----------------------------------------
   * TRIGGER FLY-TO-CART ANIMATION
   * ----------------------------------------
   * Takes the originating DOM element (e.g. the clicked button or image),
   * creates a small teal bubble at its position, and animates it flying
   * toward the cart icon in the navbar (#nav-cart-icon).
   */
  const fly = useCallback((originEl) => {
    return new Promise((resolve) => {
      const cartIcon = document.getElementById('nav-cart-icon');
      if (!cartIcon || !originEl) {
        resolve();
        return;
      }

      const originRect = originEl.getBoundingClientRect();
      const targetRect = cartIcon.getBoundingClientRect();

      const startX = originRect.left + originRect.width / 2;
      const startY = originRect.top + originRect.height / 2;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      const bubble = document.createElement('div');
      bubble.style.cssText = `
        position: fixed;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #14b8a6;
        box-shadow: 0 0 0 8px rgba(20,184,166,0.2);
        pointer-events: none;
        z-index: 9999;
        top: ${startY - 24}px;
        left: ${startX - 24}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                    opacity 0.7s ease,
                    width 0.7s ease,
                    height 0.7s ease;
        will-change: transform, opacity;
      `;
      
      // Inject Cart Icon SVG
      bubble.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      `;

      document.body.appendChild(bubble);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const dx = endX - startX;
          const dy = endY - startY;
          bubble.style.transform = `translate(${dx}px, ${dy}px)`;
          bubble.style.width = '16px';
          bubble.style.height = '16px';
          bubble.style.opacity = '0';
          
          // Shrink the icon too
          const svg = bubble.querySelector('svg');
          if (svg) {
            svg.style.width = '10px';
            svg.style.height = '10px';
            svg.style.transition = 'all 0.7s ease';
          }
        });
      });

      bubble.addEventListener('transitionend', () => {
        bubble.remove();

        // Trigger cart icon pop animation
        cartIcon.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.4)' },
            { transform: 'scale(1)' },
          ],
          { duration: 300, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
        );

        // Resolve PROMISE after bubble lands
        resolve();
      }, { once: true });
    });
  }, []);

  return fly;
}
