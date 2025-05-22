FROM node:14.18.1

# Install Chromium
RUN apt-get update && apt-get install -y chromium

WORKDIR /usr/src/app

COPY . .

RUN npm install

