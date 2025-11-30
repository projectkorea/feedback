import type React from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useFeedback } from '../hooks/useFeedback.js';
import { useSettings } from '../hooks/useSettings.js';
import type { Position, PositionStyles } from '../types.js';

export function FloatingButton(): React.JSX.Element | null {
  const { isFloatingVisible, setModalOpen } = useFeedback();
  const { settings } = useSettings();

  if (!isFloatingVisible) return null;

  const position: Position = (settings?.customization?.position as Position) || 'bottom-right';
  const positionStyles: PositionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const primaryColor = settings?.customization?.primaryColor || '#4F46E5';

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const buttonStyle: CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: primaryColor,
    color: 'white',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    transition: 'transform 0.2s',
  };

  return (
    <button onClick={() => setModalOpen(true)} style={buttonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      💬
    </button>
  );
}
