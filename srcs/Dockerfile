FROM node:20-slim

WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y gnupg ca-certificates curl

# Copy only package files
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install --include=dev

# Optional: upgrade npm version
RUN npm install -g npm@11.6.0

# Copy all other source files
COPY . .

# Run Tailwind CSS build using npx
RUN npm run build:css

# Run other build tasks
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/backend/server.js"]
