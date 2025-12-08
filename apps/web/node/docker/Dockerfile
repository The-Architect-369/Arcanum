FROM node:20-bullseye
RUN apt-get update && apt-get install -y wget jq
# Install arcanumd (replace URL with your release)
# RUN wget ... && tar -xzf ... && mv arcanumd /usr/local/bin/
WORKDIR /srv
COPY . .
RUN npm i -g helia @helia/unixfs
CMD ["bash","node/scripts/bootstrap.sh"]
