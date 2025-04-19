# Build stage
FROM node:20 as build
# Using non-Alpine Node image to avoid native module issues

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies without any Alpine-specific handling
# Fix for Rollup native module issues
RUN npm install --force && \
    mkdir -p node_modules/@rollup/ && \
    npm install @rollup/rollup-linux-x64-gnu && \
	npm install @mui/material @mui/icons-material @emotion/react @emotion/styled



# Copy the rest of the code
COPY . .

# Build the application with increased memory
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Production stage (still using Alpine for the runtime)
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]