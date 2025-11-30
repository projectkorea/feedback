import type React from 'react';
import { useState, useEffect, type ChangeEvent, type MouseEvent } from 'react';
import { useSettings } from '../hooks/useSettings.js';
import { useFeedback } from '../hooks/useFeedback.js';
import type { SettingsPanelProps, SettingsFormData, Position } from '../types.js';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps): React.JSX.Element | null {
  const { settings, isLoading, updateSettings } = useSettings();
  const { showToast } = useFeedback();

  const [formData, setFormData] = useState<SettingsFormData>({
    notifications: {
      enabled: true,
      platforms: {
        slack: false,
        discord: false,
        telegram: false,
        email: false,
      },
    },
    customization: {
      primaryColor: '#007bff',
      position: 'bottom-right',
      language: 'ko',
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        notifications: settings.notifications || formData.notifications,
        customization: (settings.customization as SettingsFormData['customization']) || formData.customization,
      });
    }
  }, [settings]);

  if (!isOpen) return null;

  const handlePlatformToggle = (platform: keyof SettingsFormData['notifications']['platforms']) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        platforms: {
          ...prev.notifications.platforms,
          [platform]: !prev.notifications.platforms[platform],
        },
      },
    }));
  };

  const handleCustomizationChange = (field: keyof SettingsFormData['customization'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateSettings(formData);
      if (result.success) {
        showToast('설정이 저장되었습니다! 🎉', 'success');
        onClose();
      } else {
        showToast(`설정 저장 실패: ${result.error}`, 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast(`오류가 발생했습니다: ${message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
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
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
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
            color: '#666',
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#111' }}>설정</h2>
        <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>알림 및 UI 커스터마이징 설정을 변경할 수 있습니다.</p>

        {isLoading && !settings ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>로딩 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>알림 설정</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.notifications.enabled}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, enabled: e.target.checked },
                      }))
                    }
                    style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>알림 활성화</span>
                </label>
              </div>

              {formData.notifications.enabled && (
                <div
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {(['slack', 'discord', 'telegram', 'email'] as const).map((platform) => (
                    <label key={platform} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.notifications.platforms[platform]}
                        onChange={() => handlePlatformToggle(platform)}
                        style={{ width: '16px', height: '16px', marginRight: '8px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>커스터마이징</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>기본 색상</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={formData.customization.primaryColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleCustomizationChange('primaryColor', e.target.value)}
                      style={{ width: '60px', height: '40px', border: '2px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.customization.primaryColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleCustomizationChange('primaryColor', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>플로팅 버튼 위치</label>
                  <select
                    value={formData.customization.position}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCustomizationChange('position', e.target.value as Position)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="bottom-right">오른쪽 하단</option>
                    <option value="bottom-left">왼쪽 하단</option>
                    <option value="top-right">오른쪽 상단</option>
                    <option value="top-left">왼쪽 상단</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>언어</label>
                  <select
                    value={formData.customization.language}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCustomizationChange('language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </section>

            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '14px',
                background: isSaving ? '#9ca3af' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
