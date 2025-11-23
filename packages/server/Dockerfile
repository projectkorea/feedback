# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY packages/core ./packages/core
COPY packages/server ./packages/server

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Set working directory to server
WORKDIR /app/packages/server

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start server
CMD ["pnpm", "start"]
