import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { APIClient, validateConfig } from '@feedback-sdk/core';
import { FEEDBACK_TYPES } from '@feedback-sdk/core';

// Toast 컴포넌트
function Toast({ message, type }) {
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
        zIndex: 1000001,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease'
      }}
    >
      {message}
    </div>
  );
}

// 플로팅 버튼 컴포넌트
function FloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
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

// 피드백 모달 컴포넌트
function FeedbackModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [category, setCategory] = useState('bug');
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit({
      type: FEEDBACK_TYPES.FLOATING,
      category,
      rating,
      message,
      userEmail: userEmail || undefined
    });

    if (result.success) {
      setCategory('bug');
      setRating(null);
      setMessage('');
      setUserEmail('');
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '32px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#111' }}>피드백 보내기</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            의견을 들려주세요. 소중한 피드백 감사합니다!
          </p>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="bug">🐛 버그 신고</option>
              <option value="feature">✨ 기능 요청</option>
              <option value="improvement">🚀 개선 제안</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              평점 (선택)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: `2px solid ${rating === n ? '#4F46E5' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: rating === n ? '#EEF2FF' : 'white',
                    cursor: 'pointer',
                    fontSize: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  {'⭐'.repeat(n)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              메시지 *
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              placeholder="여기에 의견을 작성해주세요..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              이메일 (선택)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              background: isLoading ? '#9CA3AF' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isLoading ? '전송 중...' : '전송하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main SDK 컴포넌트
export function FeedbackSDK({ config }) {
  validateConfig(config);

  const [container] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.createElement('div');
    }
    return null;
  });

  const [client] = useState(() => new APIClient(config));
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!container) return;

    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

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

  if (!container) return null;

  return createPortal(
    <>
      <FloatingButton onClick={() => setModalOpen(true)} />
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitFeedback}
        isLoading={isLoading}
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>,
    container
  );
}
