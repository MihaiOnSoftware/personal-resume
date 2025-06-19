FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

# Install a simple HTTP server to serve static files
RUN npm install -g http-server

# Serve the built files from the dist directory
CMD ["http-server", "dist", "-p", "3000"]
