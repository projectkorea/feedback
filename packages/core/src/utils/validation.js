export const validateConfig = (config) => {
  if (!config.publicKey) {
    throw new Error('publicKey is required');
  }
  if (!config.projectId) {
    throw new Error('projectId is required');
  }
  if (!config.apiUrl) {
    throw new Error('apiUrl is required');
  }
  return true;
};

export const validateFeedback = (data) => {
  if (!data.type) {
    throw new Error('type is required');
  }
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('rating must be between 1 and 5');
  }
  return true;
};
