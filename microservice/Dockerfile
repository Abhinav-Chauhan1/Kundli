FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY ephe/ ./ephe/
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
