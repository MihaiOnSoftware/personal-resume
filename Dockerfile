FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Expose the port that the Express server runs on
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"]
