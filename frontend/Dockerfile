# Stage 1: Build React SPA
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.html vite.config.ts tailwind.config.js postcss.config.js tsconfig*.json eslint.config.js ./
COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
