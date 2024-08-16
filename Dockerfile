# Use a specific Node.js version with Debian
FROM node:18

# Set the working directory
WORKDIR /user

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the desired port
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "dev"]
