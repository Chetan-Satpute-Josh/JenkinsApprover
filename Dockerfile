FROM node:lts-alpine AS PROD

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

CMD [ "node", "src/main.js"]
