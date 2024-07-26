FROM node:21 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . ./

FROM build AS build-prod

WORKDIR /usr/src/app
COPY --from=build /usr/src/app ./

RUN npm run build

RUN apt install curl
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

RUN npm prune --production
RUN /usr/local/bin/node-prune

FROM node:21-alpine AS prod

WORKDIR /usr/src/app

COPY --from=build-prod /usr/src/app/package*.json ./
COPY --from=build-prod /usr/src/app/node_modules node_modules
COPY --from=build-prod /usr/src/app/dist dist

HEALTHCHECK --interval=5s --timeout=5s --retries=3 CMD wget http://localhost:6005/api/v1/health -q -O - > /dev/null 2>&1

CMD [ "node", "./dist/main" ]
