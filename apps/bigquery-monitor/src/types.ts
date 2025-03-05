export enum DeviceStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

export interface Device {
    id: string;
    name: string;
    last_timestamp: string;  // BigQuery 中的最后数据时间
}

export interface AlertMessage {
    device_id: string;
    sensor_id: string;
    status: DeviceStatus;
    timestamp: string;
    message: string;
}
