FROM node:12-alpine
WORKDIR /app
COPY package.json /app/package.json
RUN npm config set registry http://registry.npmjs.org/ --global
RUN npm install --only=prod
COPY . /app
EXPOSE 4444
USER node
CMD ["node", "index.js"]