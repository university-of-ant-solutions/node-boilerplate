FROM node:9.11.2-alpine
MAINTAINER Hoang Nam "particle4dev@gmail.com"
LABEL description="This is dockerfile for building tool images <run test, lint, build source code>"

ENV DUMB_INIT_VERSION 1.2.0

RUN \
  apk add --no-cache --virtual .build-deps \
    gcc \
    libc-dev \
    make \
    openssl-dev \
    pcre-dev \
    zlib-dev \
    linux-headers \
    curl \
    gnupg \
    libxslt-dev \
    gd-dev \
    geoip-dev \
    perl-dev \
    wget \
    ca-certificates \
    openssl

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64 && \
    chmod +x /usr/local/bin/dumb-init

# remove packages
RUN apk del .build-deps

# Set a working directory
WORKDIR /usr/src/app

COPY package.json nodemon.json .babelrc .eslintignore .eslintrc /usr/src/app/

# Install Node.js dependencies
RUN yarn install

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 4000
CMD [ "npm", "start" ]
