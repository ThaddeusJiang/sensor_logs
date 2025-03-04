import { resolve } from 'path';
import { PubSub } from '@google-cloud/pubsub';

// 验证环境变量
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
}

// 配置
const config = {
    projectId: 'dev-iot-452706',
    topicName: 'sensor-logs-topic',
    // 模拟的传感器数量
    deviceCount: 3,
    // 每个设备的传感器数量
    sensorsPerDevice: 2,
    // 发送间隔 (毫秒)
    interval: 1000,
};

// 创建 PubSub 客户端
const pubsub = new PubSub({
    projectId: config.projectId
});

// 验证客户端连接
async function verifyAuthentication() {
    try {
        const [topics] = await pubsub.getTopics();
        console.log('Successfully authenticated with GCP');
    } catch (error) {
        console.error('Failed to authenticate with GCP:', error);
        process.exit(1);
    }
}

// 生成随机数据
function generateSensorData(deviceId: string, sensorId: string): any {
    return {
        device_id: deviceId,
        sensor_id: sensorId,
        timestamp: new Date().toISOString(),
        temperature: 20 + Math.random() * 10, // 20-30℃
        humidity: 40 + Math.random() * 20,    // 40-60%
        voltage: 3.0 + Math.random() * 0.5,   // 3.0-3.5V
        error_code: Math.random() > 0.95 ? 'ERR_001' : null, // 5% 概率出错
        status: Math.random() > 0.95 ? 'WARNING' : 'NORMAL', // 5% 概率警告
    };
}

// 发送数据到 Pub/Sub
async function publishMessage(data: any) {
    try {
        const dataBuffer = Buffer.from(JSON.stringify(data));
        const messageId = await pubsub.topic(config.topicName).publishMessage({
            data: dataBuffer,
        });
        console.log(`Message ${messageId} published for device ${data.device_id}, sensor ${data.sensor_id}`);
    } catch (error) {
        console.error('Error publishing message:', error);
    }
}

// 主循环
async function main() {
    console.log('Starting IoT sensor simulation...');

    // 验证认证
    await verifyAuthentication();

    // 为每个设备创建定时发送任务
    for (let deviceNum = 1; deviceNum <= config.deviceCount; deviceNum++) {
        const deviceId = `device-${deviceNum.toString().padStart(3, '0')}`;

        for (let sensorNum = 1; sensorNum <= config.sensorsPerDevice; sensorNum++) {
            const sensorId = `${deviceId}-sensor-${sensorNum.toString().padStart(2, '0')}`;

            // 每秒发送数据
            setInterval(() => {
                const data = generateSensorData(deviceId, sensorId);
                publishMessage(data);
            }, config.interval);
        }
    }
}

// 错误处理
process.on('SIGINT', () => {
    console.log('Stopping IoT sensor simulation...');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// 启动应用
main().catch(console.error);
