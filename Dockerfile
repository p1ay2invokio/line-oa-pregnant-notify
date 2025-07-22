FROM node:24-alpine

WORKDIR /app .

RUN apk update
RUN apk add --no-cache tzdata

COPY package.json .

RUN npm install

COPY . .

RUN npx prisma generate

CMD [ "npm", "start" ]
