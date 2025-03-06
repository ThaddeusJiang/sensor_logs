import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { DeviceStatus, AlertMessage } from './types';
import { Topics } from './topics';


const bigquery = new BigQuery();
const pubsub = new PubSub();

const OFFLINE_THRESHOLD_MINUTES = 5;

export async function checkSensorsStatus(): Promise<void> {
  console.log('check sensor status');
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
      GROUP BY
        log.device_id,
        log.sensor_id
    ) l
    ON
      s.device_id = l.device_id AND s.sensor_id = l.sensor_id
    WHERE
      s.status = 'active'
      AND l.last_timestamp < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${OFFLINE_THRESHOLD_MINUTES} MINUTE)
  `;

  try {
    const [rows] = await bigquery.query(query);

    if (rows.length === 0) {
      console.log('all sensors are online');
      return;
    }

    for (const row of rows) {
      const alertMessage: AlertMessage = {
        device_id: row.device_id,
        sensor_id: row.sensor_id,
        status: DeviceStatus.OFFLINE,
        timestamp: new Date().toISOString(),
        message: `设备 ${row.device_id} ${row.sensor_id} 离线`
      };

      try {
        await pubsub.topic(Topics.sensor_offline.topic).publishMessage({
          data: Buffer.from(JSON.stringify(alertMessage)),
          attributes: {
            device_id: row.device_id,
            sensor_id: row.sensor_id
          }
        });
        console.log(`已发送离线告警消息: device_id: ${row.device_id} sensor_id: ${row.sensor_id}`);
      } catch (pubsubError) {
        console.error(`Failed to publish alert for device: ${row.device_id} sensor: ${row.sensor_id}`, pubsubError);
      }

    }
  } catch (error) {
    console.error('检查设备状态时发生错误:', error);
  }
}
