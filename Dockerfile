FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libxss1 \
  libasound2 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libpangocairo-1.0-0 \
  libpangoft2-1.0-0 \
  libx11-xcb1 \
  fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
