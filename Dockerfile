# Use the official Bun image
FROM oven/bun

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb (if they exist)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port your server listens on
EXPOSE 3000

# Start the Bun server
CMD ["bun", "index.ts"]