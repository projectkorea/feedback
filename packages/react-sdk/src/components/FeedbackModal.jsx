import { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback.js';
import { FEEDBACK_TYPES } from '@feedback-sdk/core';

export function FeedbackModal() {
  const { isModalOpen, setModalOpen, submitFeedback, isLoading } = useFeedback();
  const [category, setCategory] = useState('bug');
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitFeedback({
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
      onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
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
          onClick={() => setModalOpen(false)}
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
