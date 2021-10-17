FROM node:alpine

RUN apk add --update --no-cache ffmpeg python3 py3-pip
RUN pip3 install pytube

WORKDIR /app

COPY . /app

CMD node server.js
EXPOSE 3000