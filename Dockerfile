FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

RUN npm config set fetch-retry-maxtimeout 600000

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000
# CMD ["npm", "run", "start:prod"]
CMD ["node", "dist/src/main.js"]