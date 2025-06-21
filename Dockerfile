# Multi-stage build for optimized production image
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Change ownership of app directory
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose the port that the Express server runs on
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"] 