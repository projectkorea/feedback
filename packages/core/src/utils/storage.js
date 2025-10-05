const STORAGE_KEY = 'feedback_sdk';

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
      return true;
    } catch {
      return false;
    }
  }
};
