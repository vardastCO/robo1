### Use the official Alpine Linux image as the base image.
##FROM alpine
##
### Install Chromium and other dependencies.
##RUN apk --no-cache add \
##    chromium \
##    nss \
##    freetype \
##    harfbuzz \
##    ca-certificates \
##    ttf-freefont \
##    nodejs \
##    npm
##
### Verify that Chromium is installed.
##RUN chromium-browser --version
##
### Create a non-privileged user.
##RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
##    && mkdir -p /home/pptruser/Downloads /app
##
### Set ownership of the /app directory to pptruser.
##RUN chown -R pptruser:pptruser /app
##
### Switch to the non-privileged user.
##USER pptruser
##
### Set the working directory to the /app directory.
##WORKDIR /app
##
### Set the executable path for Puppeteer.
##ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
##
### Copy your Node.js application code to the container.
##COPY package.json ./
##
### Remove the existing package-lock.json (if it exists).
##RUN rm -f package-lock.json
##
### Install the Node.js dependencies.
##RUN npm install
##
### Copy the rest of your application code.
##COPY . .
##
### Expose port 3002 for your Node.js application.
##EXPOSE 3002
##
### Start your Node.js application.
##CMD ["node", "scrape.js"]
#FROM node:18
#
## Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
## Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
## installs, work.
#RUN apt-get update \
#    && apt-get install -y wget gnupg \
#    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#    && apt-get update \
#    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
#      --no-install-recommends \
#    && rm -rf /var/lib/apt/lists/* \
#    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser
#
#USER pptruser
#
#WORKDIR /home/pptruser
#
## Copy your Node.js application code to the container.
#COPY package.json ./
#
## Remove the existing package-lock.json (if it exists).
#RUN rm -f package-lock.json
#
## Install the Node.js dependencies.
#RUN npm install
#
## Copy the rest of your application code.
#COPY . .
#
## Expose port 3002 for your Node.js application.
#EXPOSE 3002
#
## Start your Node.js application.
#CMD ["node", "scrape.js"]
# Use a Linux-based Node.js image

# Use the Node.js 14 base image
# Use the Node.js 14 base image

# Use the official Node.js 18 image as the base image



FROM node

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

#
# Copy the rest of your application code.
COPY . .

RUN npm install

# Expose port 3002 for your Node.js application.
EXPOSE 3002

# Start your Node.js application.
CMD ["node", "scrape.js"]
