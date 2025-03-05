import { startSubscription } from './pipeline';

// 启动 HTTP 服务器（仅用于健康检查）
const server = Bun.serve({
    port: process.env.PORT || 8080,
    fetch(req) {
        return new Response("OK", { status: 200 });
    },
});

console.log(`🦊 Server is running at http://localhost:${server.port}`);

// 等待服务器准备就绪
await new Promise(resolve => setTimeout(resolve, 1000));

// 启动后台管道
startSubscription().catch((error: unknown) => {
    console.error('Subscription failed:', error);
    process.exit(1);
});
