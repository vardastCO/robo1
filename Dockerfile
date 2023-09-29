# Use the Node.js 18-alpine base image
FROM node:18-alpine

# Set a working directory for your application
WORKDIR /app

# Install any additional dependencies you need (if necessary)
# For example, to install Chromium dependencies for Puppeteer
RUN apk add --no-cache chromium

# Copy your Node.js application code to the container
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose any necessary ports (if needed)
EXPOSE 3002

# Start your Node.js application
CMD ["node", "scrape.js"]
