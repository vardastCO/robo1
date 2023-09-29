# Use the official Alpine Linux image as the base image.
FROM alpine

# Install Chromium and other dependencies.
RUN apk --no-cache add \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm

# Verify that Chromium is installed.
RUN chromium-browser --version

# Create a non-privileged user.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app

# Set ownership of the /app directory to pptruser.
RUN chown -R pptruser:pptruser /app

# Switch to the non-privileged user.
USER pptruser

# Set the working directory to the /app directory.
WORKDIR /app

# Set the executable path for Puppeteer.
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

# Copy your Node.js application code to the container.
COPY package.json ./

# Remove the existing package-lock.json (if it exists).
RUN rm -f package-lock.json

# Install the Node.js dependencies.
RUN npm install

# Copy the rest of your application code.
COPY . .

# Expose port 3002 for your Node.js application.
EXPOSE 3002

# Start your Node.js application.
CMD ["node", "scrape.js"]
