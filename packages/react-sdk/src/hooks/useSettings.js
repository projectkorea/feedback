import { useState, useEffect, useCallback } from 'react';
import { useFeedback } from './useFeedback.js';

export function useSettings() {
  const { client } = useFeedback();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.getSettings();
      if (response.success) {
        setSettings(response.settings);
      } else {
        throw new Error(response.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError(err);
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const updateSettings = useCallback(async (newSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.updateSettings(newSettings);
      if (response.success) {
        setSettings(response.settings);
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (err) {
      setError(err);
      console.error('Failed to update settings:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [client]);

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
    refetchSettings
  };
}
