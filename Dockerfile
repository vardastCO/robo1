# Use the Node.js 18-alpine base image
FROM node:18-alpine

# Set a working directory for your application
WORKDIR /app
RUN apt-get update && \
    apt-get install -y chromium-browser && \
    rm -rf /var/lib/apt/lists/*

# Install Chromium dependencies (required for Puppeteer)
RUN apk --no-cache add chromium
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"


# Copy your Node.js application code to the container
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3002

# Start your Node.js application
CMD ["node", "scrape.js"]

