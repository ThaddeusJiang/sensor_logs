FROM oven/bun:1.0.30

WORKDIR /app

# 只复制当前目录的依赖文件
COPY package.json ./

# 安装依赖
RUN bun install

# 复制源代码
COPY src ./src

# 设置环境变量，告诉 Cloud Run 这不是 web 服务
ENV LISTEN_ON_PORT=false

# 启动应用
CMD ["bun", "start"]
