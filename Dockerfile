FROM node:14
WORKDIR /usr/src/app
COPY *.json ./
RUN npm install
COPY . .

# creates a dist dir and compiles ts code in there
RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/index.js"]