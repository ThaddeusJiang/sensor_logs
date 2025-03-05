import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { DeviceStatus, AlertMessage } from './types';

const bigquery = new BigQuery();
const pubsub = new PubSub();
const topicName = 'device-offline-alerts';
const topic = pubsub.topic(topicName);

const OFFLINE_THRESHOLD_MINUTES = 5;
const MAX_ALERTS_PER_CHECK = 1000; // 限制每次检查的最大告警数量


export async function checkDevicesStatus(): Promise<void> {
  // 检查过去 5 分钟内离线的设备
  const query = `
    SELECT
      s.device_id,
      s.sensor_id,
      s.status,
    FROM
      \`${process.env.GOOGLE_CLOUD_PROJECT}.sensor_data.sensors\` s
    LEFT JOIN (
      SELECT
        log.device_id,
        log.sensor_id,
        max(log.timestamp) as last_timestamp
      FROM
        \`${process.env.GOOGLE_CLOUD_PROJECT}.sensor_data.sensor_logs\` AS log
      WHERE
        log.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${OFFLINE_THRESHOLD_MINUTES} MINUTE)
      GROUP BY
        log.device_id,
        log.sensor_id
    ) l
    ON
      s.device_id = l.device_id AND s.sensor_id = l.sensor_id
    WHERE
      l.last_timestamp IS NULL AND s.status = 'active'
  `;

  try {
    const [rows] = await bigquery.query(query);

    for (const row of rows) {
      const alertMessage: AlertMessage = {
        device_id: row.device_id,
        sensor_id: row.sensor_id,
        status: DeviceStatus.OFFLINE,
        timestamp: new Date().toISOString(),
        message: `设备 ${row.device_id} ${row.sensor_id} 离线`
      };

      await topic.publishMessage({
        data: Buffer.from(JSON.stringify(alertMessage)),
        attributes: {
          device_id: row.device_id,
          sensor_id: row.sensor_id
        }
      });

      console.log(`已发送离线告警消息: device_id: ${row.device_id} sensor_id: ${row.sensor_id}`);
    }

    if (rows.length === MAX_ALERTS_PER_CHECK) {
      console.warn(`警告: 达到每次检查的最大告警数量 ${MAX_ALERTS_PER_CHECK}`);
    }
  } catch (error) {
    console.error('检查设备状态时发生错误:', error);
  }
}

export function fetchDevices() {
  const mock = {
    // 模拟的传感器数量
    deviceCount: 3,
    // 每个设备的传感器数量
    sensorsPerDevice: 2,
  }
  const deviceSensors: Array<{ deviceId: string, sensorId: string }> = [];

  for (let deviceNum = 1; deviceNum <= mock.deviceCount; deviceNum++) {
    const deviceId = `device-${deviceNum.toString().padStart(3, '0')}`;

    for (let sensorNum = 1; sensorNum <= mock.sensorsPerDevice; sensorNum++) {
      const sensorId = `${deviceId}-sensor-${sensorNum.toString().padStart(2, '0')}`;
      deviceSensors.push({ deviceId, sensorId });
    }
  }

  return deviceSensors;
}
