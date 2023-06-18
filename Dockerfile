FROM node:18.16.0-alpine

RUN mkdir /app/

# Set the working directory in the container
WORKDIR /app/

COPY package.json yarn.lock tsconfig.json ./

# install dependencies
RUN yarn install

COPY . /app

# build the app
RUN yarn build

# Run migrations
RUN npx knex migrate:latest

EXPOSE 3000

CMD ["yarn", "start"]
