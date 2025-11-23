/**
 * Settings 데이터 검증 미들웨어
 */
export function validateSettings(request, reply, done) {
  const { notifications, customization } = request.body;

  // notifications 검증
  if (notifications !== undefined) {
    if (typeof notifications !== 'object') {
      return reply.code(400).send({ error: 'notifications must be an object' });
    }

    if (notifications.enabled !== undefined && typeof notifications.enabled !== 'boolean') {
      return reply.code(400).send({ error: 'notifications.enabled must be boolean' });
    }

    if (notifications.platforms !== undefined) {
      if (typeof notifications.platforms !== 'object') {
        return reply.code(400).send({ error: 'notifications.platforms must be an object' });
      }

      const validPlatforms = ['slack', 'discord', 'telegram', 'email'];
      for (const [platform, enabled] of Object.entries(notifications.platforms)) {
        if (!validPlatforms.includes(platform)) {
          return reply.code(400).send({
            error: `Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`
          });
        }
        if (typeof enabled !== 'boolean') {
          return reply.code(400).send({
            error: `notifications.platforms.${platform} must be boolean`
          });
        }
      }
    }
  }

  // customization 검증
  if (customization !== undefined) {
    if (typeof customization !== 'object') {
      return reply.code(400).send({ error: 'customization must be an object' });
    }

    if (customization.primaryColor !== undefined) {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(customization.primaryColor)) {
        return reply.code(400).send({
          error: 'customization.primaryColor must be a valid hex color (e.g., #4F46E5)'
        });
      }
    }

    if (customization.position !== undefined) {
      const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
      if (!validPositions.includes(customization.position)) {
        return reply.code(400).send({
          error: `customization.position must be one of: ${validPositions.join(', ')}`
        });
      }
    }

    if (customization.language !== undefined) {
      if (typeof customization.language !== 'string' || customization.language.length === 0) {
        return reply.code(400).send({
          error: 'customization.language must be a non-empty string'
        });
      }
    }
  }

  done();
}

/**
 * 기본 Settings 값
 */
export function getDefaultSettings(projectId) {
  return {
    projectId,
    notifications: {
      enabled: true,
      platforms: {
        slack: false,
        discord: false,
        telegram: false,
        email: false
      }
    },
    customization: {
      primaryColor: '#4F46E5',
      position: 'bottom-right',
      language: 'ko'
    },
    updatedAt: Date.now()
  };
}
