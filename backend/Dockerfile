# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools in case native addons require compilation
RUN apk add --no-cache python3 make g++

# Install all dependencies including devDependencies
COPY package*.json ./
RUN npm install

# Copy configuration and source code
COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts=false

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Create non-root node user and change ownership
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
