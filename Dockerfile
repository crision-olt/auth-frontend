# Multi-stage build for auth-frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY public ./public
COPY src ./src
COPY index.html vite.config.js* ./

# Build the application
RUN npm run build

# Runtime stage - serve with Node.js
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and serve package
RUN apk add --no-cache dumb-init && npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]
