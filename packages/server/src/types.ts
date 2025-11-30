import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import type { Project, Feedback, Settings } from '@feedback-sdk/shared';

// Fastify request with project context
export interface AuthenticatedRequest extends FastifyRequest {
  project: Project;
}

// Feedback notification data (snake_case for external APIs)
export interface FeedbackNotificationData {
  id?: string;
  type?: 'floating' | 'settings';
  category: string;
  rating?: number;
  message?: string;
  user_email?: string;
  page_url?: string;
  platform?: string;
  timestamp: string;
}

// Feedback submission body
export interface FeedbackBody {
  id: string;
  type: string;
  category: string;
  rating?: number;
  message: string;
  userEmail?: string;
  pageUrl?: string;
  browserInfo?: {
    userAgent?: string;
    language?: string;
    platform?: string;
  };
  timestamp: number;
}

// Query parameters for feedback list
export interface FeedbackListQuery {
  page?: string;
  limit?: string;
  category?: string;
  minRating?: string;
}

// Project creation body
export interface CreateProjectBody {
  name: string;
}

// Position type
export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

// Settings update body
export interface SettingsBody {
  notifications?: {
    enabled?: boolean;
    platforms?: {
      slack?: boolean;
      discord?: boolean;
      telegram?: boolean;
      email?: boolean;
    };
  };
  customization?: {
    primaryColor?: string;
    position?: Position;
    language?: string;
  };
}

// Route handler type
export type RouteHandler<TBody = unknown, TQuery = unknown> = (
  request: FastifyRequest<{ Body: TBody; Querystring: TQuery }>,
  reply: FastifyReply
) => Promise<unknown>;

// Middleware type
export type MiddlewareHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => void | Promise<void>;

// Notification service adapter
export interface NotificationAdapter {
  name: string;
  service: {
    sendFeedbackNotification(feedback: FeedbackNotificationData): Promise<void>;
  };
}

// Category types
export type FeedbackCategory = 'bug' | 'feature' | 'improvement';
export type FeedbackType = 'floating' | 'settings';

export type { Project, Feedback, Settings };
