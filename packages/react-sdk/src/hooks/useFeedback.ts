import { useContext } from 'react';
import { FeedbackContext } from '../context/FeedbackContext.js';
import type { FeedbackContextValue } from '../types.js';

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
