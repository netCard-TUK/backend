# Stage 1: Build
FROM node:12-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
RUN npm prune --production
COPY . .

# Stage 2: Runtime
FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY /src ./src
COPY index.js ./index.js

EXPOSE 8000
CMD ["npm", "start"]