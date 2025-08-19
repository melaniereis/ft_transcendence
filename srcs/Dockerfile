FROM node:24

WORKDIR /usr/src/app

# install build tools needed to compile native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# prefer deterministic install in CI/build
RUN npm ci

COPY . .

# rebuild sqlite3 native bindings for the Node version in the image
RUN npm rebuild sqlite3 --build-from-source

RUN npm run build

RUN mkdir -p dist/frontend/pages/assets
RUN cp -r frontend/assets/* dist/frontend/pages/assets/

EXPOSE 3000

CMD ["npm", "run", "dev"]