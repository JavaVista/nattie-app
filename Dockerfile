# Stage 1: Build the Angular app
FROM node:bookworm-slim AS build

WORKDIR /nattie-app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run lint
RUN npm run build --prod

# Stage 2: Serve with NGINX
FROM nginx:alpine

RUN mkdir -p /var/www/nattie-app

# Copy built app to www folder
COPY --from=build /nattie-app/www /var/www/nattie-app

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
