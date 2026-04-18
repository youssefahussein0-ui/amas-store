# Use Node 22 as the base image
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-slim

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
# We also need node_modules because index.cjs is not a fat bundle
# and relies on external dependencies

# Expose port
EXPOSE 5000

ENV NODE_ENV=production

# Start command
CMD ["node", "dist/index.cjs"]
