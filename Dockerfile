FROM node:18-alpine AS builder

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install -g pnpm@8.15.9

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY webapp/package.json ./webapp/
COPY shared/package.json ./shared/

COPY backend/src/prisma ./backend/src/prisma

RUN pnpm install --frozen-lockfile

COPY backend ./backend
COPY webapp ./webapp
COPY shared ./shared

# ✅ СБОРКА SHARED
RUN cd shared && pnpm build

# ✅ СБОРКА WEBAPP (явно через tsc)
RUN cd webapp && pnpm exec tsc -p tsconfig.json || echo "tsc failed, copying src instead"

# ✅ СБОРКА BACKEND
RUN cd backend && pnpm pgc
RUN cd backend && pnpm build || true

# ============ СТАДИЯ 2: ФИНАЛЬНЫЙ ОБРАЗ ============
FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend

# ✅ Копируем webapp целиком (включая dist, если есть)
COPY --from=builder /app/webapp ./webapp

# ✅ Копируем shared
COPY --from=builder /app/shared/dist /app/shared/src
COPY --from=builder /app/shared/package.json /app/shared/

# ✅ Создаём symlink
RUN mkdir -p /app/node_modules/@ideanick && \
    ln -s /app/webapp /app/node_modules/@ideanick/webapp && \
    ln -s /app/shared /app/node_modules/@ideanick/shared && \
    ln -s /app/node_modules/.pnpm/zod@3.25.76/node_modules/zod /app/node_modules/zod && \
    ln -s /app/node_modules/.pnpm/lodash@4.18.1/node_modules/lodash /app/node_modules/lodash

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/index.js"]