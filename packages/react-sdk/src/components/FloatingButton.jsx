import { useFeedback } from '../hooks/useFeedback.js';
import { useSettings } from '../hooks/useSettings.js';

export function FloatingButton() {
  const { isFloatingVisible, setModalOpen } = useFeedback();
  const { settings } = useSettings();

  if (!isFloatingVisible) return null;

  // Position에 따른 스타일 계산
  const position = settings?.customization?.position || 'bottom-right';
  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' }
  };

  const primaryColor = settings?.customization?.primaryColor || '#4F46E5';

  return (
    <button
      onClick={() => setModalOpen(true)}
      style={{
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
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      💬
    </button>
  );
}
