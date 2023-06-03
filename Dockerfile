FROM node:18.16.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./

COPY ["package*.json", "./"]
RUN ls
RUN npm install

COPY . /app
RUN ls
