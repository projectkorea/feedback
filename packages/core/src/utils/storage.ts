const STORAGE_KEY = 'feedback_sdk';

export const storage = {
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
      return true;
    } catch {
      return false;
    }
  },
};
