FROM node:lts-buster as builder
WORKDIR $HOME/app
COPY package.json .
RUN npm install
COPY . .
RUN npm run start