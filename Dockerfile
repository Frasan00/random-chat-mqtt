FROM node:17
WORKDIR /usr/src/app
COPY *.json ./
RUN npm install
COPY . .

# creates a dist dir and compiles ts code in there
RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "node", "dist/index.js" ]
