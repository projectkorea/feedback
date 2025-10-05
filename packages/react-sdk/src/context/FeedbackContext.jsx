import { createContext, useState, useCallback } from 'react';
import { APIClient, validateConfig } from '@feedback-sdk/core';
import { FloatingButton } from '../components/FloatingButton.jsx';
import { FeedbackModal } from '../components/FeedbackModal.jsx';

export const FeedbackContext = createContext(null);

function Toast({ message, type, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: 'white',
        zIndex: 1000000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease'
      }}
    >
      {message}
    </div>
  );
}

export function FeedbackProvider({ config, children }) {
  validateConfig(config);

  const [client] = useState(() => new APIClient(config));
  const [isFloatingVisible, setFloatingVisible] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const submitFeedback = useCallback(async (data) => {
    setLoading(true);
    try {
      await client.submitFeedback({
        ...data,
        pageUrl: window.location.href,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      });
      setModalOpen(false);
      showToast('피드백이 전송되었습니다! 🎉', 'success');
      return { success: true };
    } catch (error) {
      showToast(`전송 중 오류가 발생했습니다: ${error.message}`, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [client, showToast]);

  const value = {
    config,
    client,
    isFloatingVisible,
    setFloatingVisible,
    isModalOpen,
    setModalOpen,
    submitFeedback,
    isLoading,
    showToast
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* SDK UI 자동 렌더링 */}
      <FloatingButton />
      <FeedbackModal />
    </FeedbackContext.Provider>
  );
}
