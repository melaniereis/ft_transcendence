FROM node:18-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY certs/ certs/

RUN npm run build

RUN mkdir -p dist/frontend/pages/assets
RUN cp -r frontend/assets/* dist/frontend/pages/assets/

EXPOSE 3000

CMD ["npm", "run", "dev"]
