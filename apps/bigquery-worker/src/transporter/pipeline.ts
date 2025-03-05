import { BigQuery } from '@google-cloud/bigquery';
import { PubSub, Message } from '@google-cloud/pubsub';

interface SensorData {
    device_id: string;
    sensor_id: string;
    timestamp: string;
    temperature?: number;
    humidity?: number;
    voltage?: number;
    error_code?: string;
    status?: string;
}

// 初始化 BigQuery 客户端
const bigquery = new BigQuery();
const pubsub = new PubSub();

// 配置
const config = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    subscriptionName: 'sensor-logs-sub-01',
    datasetId: 'sensor_data',
    tableId: 'sensor_logs',
    batchSize: 100, // 批量插入的大小
    batchTimeout: 10000, // 批量插入超时时间（毫秒）
};

// 消息处理缓冲区
let messageBuffer: SensorData[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

// 处理消息
async function handleMessage(message: Message) {
    try {
        const data = JSON.parse(message.data.toString()) as SensorData;
        messageBuffer.push(data);

        // 如果缓冲区达到批量大小，立即处理
        if (messageBuffer.length >= config.batchSize) {
            await processBatch();
        }
        // 如果还没有设置超时，设置一个
        else if (!batchTimeout) {
            batchTimeout = setTimeout(async () => {
                if (messageBuffer.length > 0) {
                    await processBatch();
                }
            }, config.batchTimeout);
        }

        // 确认消息
        message.ack();
    } catch (error) {
        console.error('Error processing message:', error);
        message.nack(); // 消息处理失败，拒绝确认
    }
}

// 批量处理数据
async function processBatch() {
    if (messageBuffer.length === 0) return;

    const batchToProcess = [...messageBuffer];
    messageBuffer = [];
    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }

    try {
        // 插入数据到 BigQuery
        await bigquery
            .dataset(config.datasetId)
            .table(config.tableId)
            .insert(batchToProcess);

        console.log(`Successfully inserted ${batchToProcess.length} rows`);
    } catch (error) {
        console.error('Error inserting data to BigQuery:', error);
        // 可以将失败的数据写入死信队列或错误日志
    }
}

// 启动订阅
export async function startTransporting() {
    const subscription = pubsub.subscription(config.subscriptionName);

    subscription.on('message', handleMessage);
    subscription.on('error', error => {
        console.error('Subscription error:', error);
    });

    console.log(`Listening for messages on ${config.subscriptionName}`);
}

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Processing remaining messages...');
    if (messageBuffer.length > 0) {
        await processBatch();
    }
    process.exit(0);
});
