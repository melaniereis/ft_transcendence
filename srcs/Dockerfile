FROM node:20-slim

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN apt-get update && apt-get install -y gnupg ca-certificates curl

RUN npm install

# Optional: upgrade npm
RUN npm install -g npm@11.6.0

# Install curl (if needed at runtime)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Copy frontend assets
RUN mkdir -p dist/frontend/pages/assets
RUN cp -r frontend/assets/* dist/frontend/pages/assets/

EXPOSE 3000

CMD ["node", "dist/backend/server.js"]
