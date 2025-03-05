FROM oven/bun:1

WORKDIR /app
COPY package.json .


RUN bun install --production

COPY src src

ENV PORT=8080
CMD ["bun", "start"]
