FROM node:24-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run db:generate
RUN npm run build

FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=127.0.0.1
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends apache2 \
  && a2enmod proxy proxy_http headers rewrite \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/apache2/sites-enabled/000-default.conf

COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN a2ensite 000-default \
  && chmod +x /usr/local/bin/docker-entrypoint \
  && chown -R www-data:www-data /var/www/html /var/log/apache2 /app

EXPOSE 80

ENTRYPOINT ["docker-entrypoint"]
