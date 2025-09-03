FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies (including TypeScript)
RUN npm install

# Optional: upgrade npm if needed
RUN npm install -g npm@11.5.2

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY . .

COPY certs/ certs/

# Now build
RUN npm run build

RUN mkdir -p dist/frontend/pages/assets
RUN cp -r frontend/assets/* dist/frontend/pages/assets/

EXPOSE 3000

CMD ["npm", "run", "dev"]