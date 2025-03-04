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

interface BatchConfig {
    maxSize: number;
    maxWaitTime: number; // milliseconds
}

class SensorLogsPipeline {
    private pubsub: PubSub;
    private bigquery: BigQuery;
    private buffer: SensorData[] = [];
    private lastFlushTime: number = Date.now();
    private subscription: any;
    private flushInterval: ReturnType<typeof setInterval> | null = null;

    constructor(
        private projectId: string,
        private topicName: string,
        private datasetId: string,
        private tableId: string,
        private batchConfig: BatchConfig
    ) {
        this.pubsub = new PubSub({ projectId });
        this.bigquery = new BigQuery({ projectId });
    }

    private async processMessage(message: Message) {
        try {
            const data = JSON.parse(message.data.toString()) as SensorData;
            this.buffer.push(data);
            message.ack();

            if (this.shouldFlushBuffer()) {
                await this.flushBuffer();
            }
        } catch (error) {
            console.error('Error processing message:', error);
            message.nack();
        }
    }

    private shouldFlushBuffer(): boolean {
        const now = Date.now();
        return (
            this.buffer.length >= this.batchConfig.maxSize ||
            now - this.lastFlushTime >= this.batchConfig.maxWaitTime
        );
    }

    private async flushBuffer() {
        if (this.buffer.length === 0) return;

        const dataToInsert = [...this.buffer];
        this.buffer = [];
        this.lastFlushTime = Date.now();

        try {
            await this.bigquery
                .dataset(this.datasetId)
                .table(this.tableId)
                .insert(dataToInsert);

            console.log(`Successfully inserted ${dataToInsert.length} rows`);
        } catch (error) {
            console.error('Error inserting data to BigQuery:', error);
            // 在错误情况下，将数据放回缓冲区
            this.buffer = [...dataToInsert, ...this.buffer];
        }
    }

    public async start() {
        console.log('Starting pipeline...');
        const subscription = this.pubsub
            .topic(this.topicName)
            .subscription(`${this.topicName}-sub`);

        try {
            await subscription.get({ autoCreate: true });
            console.log('Subscription ready');
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }

        this.subscription = subscription.on('message', this.processMessage.bind(this));

        // 定期刷新缓冲区
        this.flushInterval = setInterval(async () => {
            if (this.buffer.length > 0) {
                await this.flushBuffer();
            }
        }, this.batchConfig.maxWaitTime);

        console.log('Pipeline started successfully');
    }

    public async stop() {
        console.log('Stopping pipeline...');

        if (this.subscription) {
            this.subscription.removeAllListeners();
        }

        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }

        await this.flushBuffer(); // 确保所有数据都被处理
        console.log('Pipeline stopped');
    }
}

// 启动 pipeline
const pipeline = new SensorLogsPipeline(
    'dev-iot-452706',
    'sensor-logs-topic',
    'iot_data',
    'sensor_logs',
    {
        maxSize: 1000,        // 每批次最大记录数
        maxWaitTime: 60000,   // 最大等待时间（1分钟）
    }
);

// 错误处理
process.on('SIGINT', async () => {
    console.log('Stopping pipeline...');
    await pipeline.stop();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// 启动应用
pipeline.start().catch(console.error);
