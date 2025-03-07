import { BigQuery } from '@google-cloud/bigquery';
import { fetchSensors } from "../mock/sensors"

const bigquery = new BigQuery();

async function initSensors() {
    const sensors = fetchSensors();
    const rows = sensors.map(s => ({
        device_id: s.device_id,
        sensor_id: s.sensor_id,
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
    initSensors().catch(error => {
        console.error('Initialization failed:', error);
        process.exit(1);
    });
}
