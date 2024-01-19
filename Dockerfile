# Stage 1: Build
FROM node:14-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Stage 2: Runtime
FROM node:14-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 8000
CMD ["npm", "start"]