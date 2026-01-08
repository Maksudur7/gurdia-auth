FROM node:22-slim

WORKDIR /app

RUN npm config set fetch-retry-maxtimeout 600000

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]