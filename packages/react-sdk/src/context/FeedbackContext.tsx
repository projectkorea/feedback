import type React from 'react';
import { createContext, useState, useCallback, type ReactNode, type Context } from 'react';
import { APIClient, validateConfig, type FeedbackConfig, type FeedbackSubmission } from '@feedback-sdk/core';
import { FloatingButton } from '../components/FloatingButton.js';
import { FeedbackModal } from '../components/FeedbackModal.js';
import type { FeedbackContextValue, ToastProps } from '../types.js';

export const FeedbackContext: Context<FeedbackContextValue | null> = createContext<FeedbackContextValue | null>(null);

function Toast({ message, type }: ToastProps): React.JSX.Element {
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
        animation: 'slideIn 0.3s ease',
      }}
    >
      {message}
    </div>
  );
}

interface FeedbackProviderProps {
  config: FeedbackConfig;
  children: ReactNode;
}

export function FeedbackProvider({ config, children }: FeedbackProviderProps): React.JSX.Element {
  validateConfig(config);

  const [client] = useState(() => new APIClient(config));
  const [isFloatingVisible, setFloatingVisible] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const submitFeedback = useCallback(
    async (data: FeedbackSubmission): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      try {
        await client.submitFeedback({
          ...data,
          pageUrl: window.location.href,
          browserInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
          },
        });
        setModalOpen(false);
        showToast('피드백이 전송되었습니다! 🎉', 'success');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showToast(`전송 중 오류가 발생했습니다: ${message}`, 'error');
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [client, showToast]
  );

  const value: FeedbackContextValue = {
    config,
    client,
    isFloatingVisible,
    setFloatingVisible,
    isModalOpen,
    setModalOpen,
    submitFeedback,
    isLoading,
    showToast,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
      <FloatingButton />
      <FeedbackModal />
    </FeedbackContext.Provider>
  );
}
