FROM node:20.18.0

RUN npm install -g pnpm@8.15.4

WORKDIR /app

COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --ignore-scripts --frozen-lockfile

ARG NODE_ENV=production
ARG VITE_WEBAPP_ROLLBAR_CLIENT_TOKEN
ARG WEBAPP_ROLLBAR_ACCESS_TOKEN
ARG VITE_WEBAPP_ROLLBAR_ACCESS_TOKEN
ARG ROLLBAR_SERVER_ACCESS_TOKEN
ARG SOURCE_VERSION

# Генерируем Prisma client
RUN pnpm b prepare

# Собираем webapp (нужен dist для backend)
RUN pnpm w build

FROM node:20.18.0-alpine

# Устанавливаем pnpm
RUN npm install -g pnpm@8.15.4

# Копируем workspace файлы
COPY --from=0 /app/package.json /app/package.json
COPY --from=0 /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=0 /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

# Копируем package.json для всех пакетов
COPY --from=0 /app/webapp/package.json /app/webapp/package.json
COPY --from=0 /app/backend/package.json /app/backend/package.json
COPY --from=0 /app/shared/package.json /app/shared/package.json

# Копируем ВСЕ исходники
COPY --from=0 /app/backend/src /app/backend/src
COPY --from=0 /app/shared/src /app/shared/src
COPY --from=0 /app/webapp/src /app/webapp/src

# Копируем tsconfig файлы
COPY --from=0 /app/backend/tsconfig.json /app/backend/tsconfig.json
COPY --from=0 /app/backend/tsconfig.build.json /app/backend/tsconfig.build.json
COPY --from=0 /app/shared/tsconfig.json /app/shared/tsconfig.json
COPY --from=0 /app/webapp/tsconfig.json /app/webapp/tsconfig.json
COPY --from=0 /app/webapp/tsconfig.node.json /app/webapp/tsconfig.node.json

# Копируем собранный webapp dist
COPY --from=0 /app/webapp/dist /app/webapp/dist

# Копируем prisma schema
COPY --from=0 /app/backend/src/prisma /app/backend/src/prisma

WORKDIR /app

# Устанавливаем ВСЕ зависимости (включая ts-node)
RUN pnpm install --ignore-scripts --frozen-lockfile

# Генерируем Prisma client
RUN pnpm b pgc

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

CMD pnpm b pmp && pnpm b start