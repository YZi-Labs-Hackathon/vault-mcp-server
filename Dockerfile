FROM node:23-alpine AS development
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

# Install dependencies and build the server subproject
WORKDIR /app/src/server
RUN yarn
RUN yarn build


FROM node:23-alpine AS production
RUN npm install -g pm2
WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn --production
COPY --from=development /app/dist ./dist

# Copy all server folder
COPY --from=development /app/src/server ./src/server

COPY ./ecosystem.config.js ./
CMD ["pm2-runtime", "start", "ecosystem.config.js"]