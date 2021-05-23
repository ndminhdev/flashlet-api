# base
FROM node:15-alpine AS base
RUN mkdir -p /app
WORKDIR /app

# build step
FROM base AS builder
COPY . ./
RUN npm install --silent
RUN npm run build

# production step
FROM base as production
RUN apk --no-cache add --virtual builds-deps build-base python
COPY package.json ./
RUN npm install --production --silent
COPY --from=builder /app/dist ./dist
COPY .env.production ./
CMD ["npm", "run", "serve"]





