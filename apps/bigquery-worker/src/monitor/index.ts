import { checkSensorsStatus } from './monitor';
import { subscribeSensorOffline } from './subscriber';

const CHECK_INTERVAL = 60000; // 每分钟检查一次

async function monitorDevices() {
    try {
        await checkSensorsStatus();
    } catch (error) {
        console.error('监控过程发生错误:', error);
    }
}

// 初始化并启动监控
export async function startMonitoring() {
    // 订阅离线告警
    await subscribeSensorOffline();

    // 启动定时监控
    setInterval(monitorDevices, CHECK_INTERVAL);
}
