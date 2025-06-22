# Multi-stage build for optimized production image
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept GitHub token as build argument for commit history generation
ARG GITHUB_TOKEN
ARG GITHUB_OWNER=MihaiOnSoftware
ARG GITHUB_REPO=personal-resume
ARG GITHUB_COMMIT_LIMIT=500
ARG OPENWEATHERMAP_API_KEY

# Set environment variables for the build process
ENV GITHUB_TOKEN=$GITHUB_TOKEN
ENV GITHUB_OWNER=$GITHUB_OWNER
ENV GITHUB_REPO=$GITHUB_REPO
ENV GITHUB_COMMIT_LIMIT=$GITHUB_COMMIT_LIMIT
ENV OPENWEATHERMAP_API_KEY=$OPENWEATHERMAP_API_KEY

# Copy package files and install ALL dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code and build
COPY . .

RUN echo "GITHUB_COMMIT_LIMIT: $GITHUB_COMMIT_LIMIT"
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

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