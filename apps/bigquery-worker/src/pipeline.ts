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

interface PipelineState {
    pubsub: PubSub;
    bigquery: BigQuery;
    buffer: SensorData[];
    lastFlushTime: number;
    subscription: any;
    flushInterval: ReturnType<typeof setInterval> | null;
    topicName: string;
    datasetId: string;
    tableId: string;
    batchConfig: BatchConfig;
}

function createPipelineState(
    topicName: string,
    datasetId: string,
    tableId: string,
    batchConfig: BatchConfig
): PipelineState {
    const pubsub = new PubSub();
    const bigquery = new BigQuery();

    return {
        pubsub,
        bigquery,
        buffer: [],
        lastFlushTime: Date.now(),
        subscription: null,
        flushInterval: null,
        topicName,
        datasetId,
        tableId,
        batchConfig,
    };
}

async function processMessage(state: PipelineState, message: Message) {
    try {
        const data = JSON.parse(message.data.toString()) as SensorData;
        state.buffer.push(data);
        message.ack();

        if (shouldFlushBuffer(state)) {
            await flushBuffer(state);
        }
    } catch (error) {
        console.error('Error processing message:', error);
        message.nack();
    }
}

function shouldFlushBuffer(state: PipelineState): boolean {
    const now = Date.now();
    return (
        state.buffer.length >= state.batchConfig.maxSize ||
        now - state.lastFlushTime >= state.batchConfig.maxWaitTime
    );
}

async function flushBuffer(state: PipelineState) {
    if (state.buffer.length === 0) return;

    const dataToInsert = [...state.buffer];
    state.buffer = [];
    state.lastFlushTime = Date.now();

    try {
        await state.bigquery
            .dataset(state.datasetId)
            .table(state.tableId)
            .insert(dataToInsert);

        console.log(`Successfully inserted ${dataToInsert.length} rows`);
    } catch (error) {
        console.error('Error inserting data to BigQuery:', error);
        state.buffer = [...dataToInsert, ...state.buffer];
    }
}

async function startPipeline(state: PipelineState) {
    console.log('Starting pipeline...');
    const subscription = state.pubsub
        .topic(state.topicName)
        .subscription(`${state.topicName}-sub`);

    try {
        await subscription.get({ autoCreate: true });
        console.log('Subscription ready');
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }

    state.subscription = subscription.on('message', (message: Message) =>
        processMessage(state, message)
    );

    state.flushInterval = setInterval(async () => {
        if (state.buffer.length > 0) {
            await flushBuffer(state);
        }
    }, state.batchConfig.maxWaitTime);

    console.log('Pipeline started successfully');
}

async function stopPipeline(state: PipelineState) {
    console.log('Stopping pipeline...');

    if (state.subscription) {
        state.subscription.removeAllListeners();
    }

    if (state.flushInterval) {
        clearInterval(state.flushInterval);
    }

    await flushBuffer(state);
    console.log('Pipeline stopped');
}

// 修改启动部分
try {
    const pipelineState = createPipelineState(
        'sensor-logs-topic',
        'iot_data',
        'sensor_logs',
        {
            maxSize: 1000,
            maxWaitTime: 60 * 1000, // 60 seconds
        }
    );

    // 错误处理
    process.on('SIGINT', async () => {
        console.log('Stopping pipeline...');
        await stopPipeline(pipelineState);
        process.exit(0);
    });

    process.on('unhandledRejection', (error) => {
        console.error('Unhandled rejection:', error);
    });

    // 启动应用
    startPipeline(pipelineState).catch(console.error);
} catch (error) {
    console.error('Failed to start pipeline:', error);
    process.exit(1);
}
