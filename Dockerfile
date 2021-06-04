FROM node:15-alpine
WORKDIR /usr/src/app
ENV PORT=3000

COPY ./package.json ./
RUN npm install --silent
COPY . .

EXPOSE ${PORT}/tcp

ENTRYPOINT [ "npm", "start" ]