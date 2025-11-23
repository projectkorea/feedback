/**
 * @typedef {Object} FeedbackConfig
 * @property {string} publicKey
 * @property {string} projectId
 * @property {string} apiUrl
 */

/**
 * @typedef {Object} FeedbackSubmission
 * @property {'floating' | 'settings'} type
 * @property {'bug' | 'feature' | 'improvement'} [category]
 * @property {number} [rating]
 * @property {string} [message]
 * @property {string} [userEmail]
 * @property {string} [pageUrl]
 * @property {Object} [browserInfo]
 * @property {Object} [customFields]
 */

export const FEEDBACK_TYPES = {
  FLOATING: 'floating',
  SETTINGS: 'settings'
};

export const FEEDBACK_CATEGORIES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement'
};

export const API_ENDPOINTS = {
  SUBMIT_FEEDBACK: '/api/feedback',
  GET_SETTINGS: '/api/settings',
  UPDATE_SETTINGS: '/api/settings',
  GET_PROJECT: '/api/projects'
};
