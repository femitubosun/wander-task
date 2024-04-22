FROM node:14
# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install dependencies
RUN npm install

#
#RUN npm uninstall sqlite3
#
#RUN npm install sqlite3 --build-from-source --sqlite=/usr/local

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

