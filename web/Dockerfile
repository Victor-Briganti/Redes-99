FROM debian:stable

RUN apt-get -y update && apt-get install -y npm

COPY package.json /home/package.json
COPY package-lock.json /home/package-lock.json
COPY server.js /home/server.js

WORKDIR /home

RUN npm install 

CMD ["npm", "start"]
