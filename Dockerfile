# Use a Debian-based image as the base
FROM node:14

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

# Install dependencies required to build Redis from source
RUN apt-get update && apt-get install -y \
    build-essential \
    wget

# Download Redis 7.0.11 source code and compile it
RUN wget http://download.redis.io/releases/redis-7.0.11.tar.gz
RUN tar xvzf redis-7.0.11.tar.gz
WORKDIR /app/redis-7.0.11
RUN make
RUN make install

# Cleanup unnecessary files
WORKDIR /app
RUN rm -rf redis-7.0.11 redis-7.0.11.tar.gz

# Expose Redis port (default is 6379)
EXPOSE 6379
EXPOSE 3054

# Start both Node.js app and Redis
CMD redis-server & npm start