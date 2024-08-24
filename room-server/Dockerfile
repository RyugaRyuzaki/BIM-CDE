# Version 4
FROM node:21-alpine3.19 AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

FROM node:21-alpine3.19 AS final
WORKDIR /app
# RUN npm install -g pm2
COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
CMD [ "yarn", "start" ]

