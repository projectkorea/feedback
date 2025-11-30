import { useState, useEffect, useCallback } from 'react';
import { useFeedback } from './useFeedback.js';
import type { Settings } from '@feedback-sdk/core';
import type { UseSettingsReturn, SettingsFormData } from '../types.js';

export function useSettings(): UseSettingsReturn {
  const { client } = useFeedback();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.getSettings();
      setSettings(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const updateSettings = useCallback(
    async (newSettings: Partial<SettingsFormData>): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.updateSettings(newSettings);
        setSettings(response);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error('Failed to update settings:', err);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const refetchSettings = useCallback(() => {
    return fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetchSettings,
  };
}
