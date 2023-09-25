FROM node:14

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3054

# CMD npm start
CMD [ "npm", "start"]