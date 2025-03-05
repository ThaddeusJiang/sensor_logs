import { BigQuery } from '@google-cloud/bigquery';
import { fetchSensors } from "./sensors"

const bigquery = new BigQuery();

async function initDevices() {
    const sensors = fetchSensors();
    const rows = sensors.map(s => ({
        device_id: s.deviceId,
        sensor_id: s.sensorId,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active'
    }));

    try {
        await bigquery.dataset('sensor_data')
            .table('sensors')
            .insert(rows);

        console.log(`成功初始化 ${rows.length} 个传感器记录`);
    } catch (error) {
        console.error('初始化传感器数据失败:', error);
        throw error;
    }
}

// 如果直接运行此文件则执行初始化
if (require.main === module) {
    initDevices().catch(error => {
        console.error('初始化失败:', error);
        process.exit(1);
    });
}
