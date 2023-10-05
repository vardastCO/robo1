FROM ghcr.io/puppeteer/puppeteer:19.7.2


WORKDIR /usr/src/app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true \ 
   PUPPETEER_EXECUTABLE_PATH = /usr/bin/google-chrome-stable


# # Install Google Chrome Stable and fonts
# # Note: this installs the necessary libs to make the browser work with Puppeteer.
# RUN apt-get update && apt-get install gnupg wget -y && \
#   wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
#   sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
#   apt-get update && \
#   apt-get install google-chrome-stable -y --no-install-recommends && \
#   rm -rf /var/lib/apt/lists/*

# RUN chmod -R 755 /usr/bin/google-chrome


# FROM ghcr.io/puppeteer/puppeteer:latest
# WORKDIR usr/src/app

#
# Copy the rest of your application code.

# Switch to the 'node' user
USER node



RUN npm install

COPY . .
# Expose port 3002 for your Node.js application.
EXPOSE 3002

# Start your Node.js application.
CMD ["node", "scrape.js"]
