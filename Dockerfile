FROM alpine

# Installs latest Chromium (100) package.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
RUN apk add --no-cache nodejs npm

RUN apk update

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app

# Set the /app directory ownership to pptruser
RUN chown -R pptruser:pptruser /app

# Switch to the non-privileged user
USER pptruser

# Set the working directory to the app directory
WORKDIR /app

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

# Copy your Node.js application code to the container
COPY package.json ./

# Remove the existing package-lock.json (if it exists)
RUN rm -f package-lock.json

# Install the Node.js dependencies
RUN npm install

COPY . .

EXPOSE 3002

# Start your Node.js application
CMD ["node", "scrape.js"]
