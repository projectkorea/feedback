import { useFeedback } from '../hooks/useFeedback.js';

export function FloatingButton() {
  const { isFloatingVisible, setModalOpen } = useFeedback();

  if (!isFloatingVisible) return null;

  return (
    <button
      onClick={() => setModalOpen(true)}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#4F46E5',
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
