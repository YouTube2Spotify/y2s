FROM node:alpine
RUN apk add  --no-cache ffmpeg

WORKDIR /app

COPY . /app

CMD node server.js
EXPOSE 3000