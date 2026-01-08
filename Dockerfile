FROM node:20-alpine

WORKDIR /app

# ---------- BACKEND ----------
COPY restaurantService ./restaurantService
WORKDIR /app/restaurantService
RUN npm install
RUN npm run build

# ---------- FRONTEND ----------
WORKDIR /app
COPY FrontEnd ./FrontEnd
WORKDIR /app/FrontEnd
RUN npm install
RUN npm run build

# ---------- RUN ----------
WORKDIR /app/restaurantService
EXPOSE 3000
CMD ["node", "build/index.js"]
