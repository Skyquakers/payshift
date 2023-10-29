FROM node:18-alpine
WORKDIR /app

RUN npm install -g pnpm
COPY ["package.json", "package-lock.json", "./"]
COPY . .
RUN pnpm install
EXPOSE 3000

CMD [ "npm", "run", "dev" ]