import { checkDevicesStatus } from './monitor';

const CHECK_INTERVAL = 60000; // 每分钟检查一次

async function monitorDevices() {
    try {
        await checkDevicesStatus();
    } catch (error) {
        console.error('监控过程发生错误:', error);
    }
}

// 初始化并启动监控
export async function startMonitoring() {
    try {
        // 启动定时监控
        setInterval(monitorDevices, CHECK_INTERVAL);
        monitorDevices(); // 立即开始第一次检查
    } catch (error) {
        console.error('启动监控服务失败:', error);
        process.exit(1);
    }
}
