# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Test
FROM deps AS test
COPY . .
CMD ["npm", "test"]

# Stage 3: Build the React app
FROM deps AS build
COPY . .
RUN npm run build

# Stage 4: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4000
CMD ["nginx", "-g", "daemon off;"]
