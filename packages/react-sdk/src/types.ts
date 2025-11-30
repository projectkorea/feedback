import type { ReactNode, CSSProperties } from 'react';
import type { APIClient, FeedbackConfig, FeedbackSubmission, Settings } from '@feedback-sdk/core';

export interface FeedbackContextValue {
  config: FeedbackConfig;
  client: APIClient;
  isFloatingVisible: boolean;
  setFloatingVisible: (visible: boolean) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  submitFeedback: (data: FeedbackSubmission) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export interface FeedbackProviderProps {
  config: FeedbackConfig;
  children: ReactNode;
}

export interface FeedbackSDKProps {
  config: FeedbackConfig;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SettingsFormData {
  notifications: {
    enabled: boolean;
    platforms: {
      slack: boolean;
      discord: boolean;
      telegram: boolean;
      email: boolean;
    };
  };
  customization: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    language: string;
  };
}

export interface UseSettingsReturn {
  settings: Settings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: Partial<SettingsFormData>) => Promise<{ success: boolean; error?: string }>;
  refetchSettings: () => Promise<void>;
}

export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface PositionStyles {
  [key: string]: CSSProperties;
}
