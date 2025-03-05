FROM oven/bun:1.2.2

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

ENV GOOGLE_CLOUD_PROJECT=dev-iot-452706
ENV LISTEN_ON_PORT=false

CMD ["bun", "start"]
