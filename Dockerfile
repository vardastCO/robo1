FROM alpine

# Installs latest Chromium (100) package.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
RUN apk add --no-cache nodejs npm

RUN apk update

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser


ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"


# Copy your Node.js application code to the container
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3002

# Start your Node.js application
CMD ["node", "scrape.js"]

