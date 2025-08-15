FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p dist/frontend/pages/assets
RUN cp -r frontend/assets/* dist/frontend/pages/assets/

EXPOSE 3000

CMD ["npm", "run", "dev"]