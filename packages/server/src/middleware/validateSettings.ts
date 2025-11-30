import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import type { SettingsBody } from '../types.js';

/**
 * Settings 데이터 검증 미들웨어
 */
export function validateSettings(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const body = request.body as SettingsBody;
  const { notifications, customization } = body;

  // notifications 검증
  if (notifications !== undefined) {
    if (typeof notifications !== 'object') {
      reply.code(400).send({ error: 'notifications must be an object' });
      return;
    }

    if (notifications.enabled !== undefined && typeof notifications.enabled !== 'boolean') {
      reply.code(400).send({ error: 'notifications.enabled must be boolean' });
      return;
    }

    if (notifications.platforms !== undefined) {
      if (typeof notifications.platforms !== 'object') {
        reply.code(400).send({ error: 'notifications.platforms must be an object' });
        return;
      }

      const validPlatforms = ['slack', 'discord', 'telegram', 'email'];
      for (const [platform, enabled] of Object.entries(notifications.platforms)) {
        if (!validPlatforms.includes(platform)) {
          reply.code(400).send({
            error: `Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`,
          });
          return;
        }
        if (typeof enabled !== 'boolean') {
          reply.code(400).send({
            error: `notifications.platforms.${platform} must be boolean`,
          });
          return;
        }
      }
    }
  }

  // customization 검증
  if (customization !== undefined) {
    if (typeof customization !== 'object') {
      reply.code(400).send({ error: 'customization must be an object' });
      return;
    }

    if (customization.primaryColor !== undefined) {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(customization.primaryColor)) {
        reply.code(400).send({
          error: 'customization.primaryColor must be a valid hex color (e.g., #4F46E5)',
        });
        return;
      }
    }

    if (customization.position !== undefined) {
      const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
      if (!validPositions.includes(customization.position)) {
        reply.code(400).send({
          error: `customization.position must be one of: ${validPositions.join(', ')}`,
        });
        return;
      }
    }

    if (customization.language !== undefined) {
      if (typeof customization.language !== 'string' || customization.language.length === 0) {
        reply.code(400).send({
          error: 'customization.language must be a non-empty string',
        });
        return;
      }
    }
  }

  done();
}

/**
 * 기본 Settings 값
 */
interface DefaultSettings {
  projectId: string;
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
    position: string;
    language: string;
  };
  updatedAt: number;
}

export function getDefaultSettings(projectId: string): DefaultSettings {
  return {
    projectId: projectId,
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
      primaryColor: '#4F46E5',
      position: 'bottom-right',
      language: 'ko',
    },
    updatedAt: Date.now(),
  };
}
