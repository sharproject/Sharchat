FROM node:lts-alpine AS development
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY prisma ./prisma

RUN npm i

COPY . .
RUN npm run prisma:client
RUN npm run build

FROM node:lts-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/package.json ./
COPY --from=development /usr/src/app/package-lock.json ./
COPY --from=development /usr/src/app/dist ./dist
COPY ./prisma/ ./prisma/
COPY ./start-docker.sh ./start-docker.sh

CMD ["sh","./start-docker.sh"]
