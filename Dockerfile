FROM node:20-alpine

RUN npm install -g pnpm@8.15.4

WORKDIR /app

# Копируем package.json для установки зависимостей
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY webapp/package.json ./webapp/
COPY shared/package.json ./shared/

# Устанавливаем зависимости (без prepare скриптов)
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Копируем все исходники
COPY . .

# Копируем уже собранный dist из локальной папки
COPY backend/dist /app/backend/dist

# Копируем shared в dist (для доступа в рантайме)
RUN cp -r /app/shared /app/backend/dist/shared

EXPOSE 3000

CMD cd /app/backend && node dist/index.js