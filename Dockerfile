FROM node:6.7.0
MAINTAINER Hoang Nam "particle4dev@gmail.com"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json nodemon.json .babelrc .eslintignore .eslintrc /usr/src/app/

RUN npm install

# Bundle app source
# COPY . /usr/src/app

EXPOSE 4000
CMD [ "npm", "start" ]
