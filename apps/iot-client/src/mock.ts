export function fetchSensors() {
    const mock = {
        deviceCount: 2,
        sensorsPerDevice: 2,
    }
    const sensors: Array<{ device_id: string, sensor_id: string }> = [];

    for (let deviceNum = 1; deviceNum <= mock.deviceCount; deviceNum++) {
        const device_id = `device-${deviceNum.toString().padStart(6, '0')}`;

        for (let sensorNum = 1; sensorNum <= mock.sensorsPerDevice; sensorNum++) {
            const sensor_id = `sensor-${sensorNum.toString().padStart(10, '0')}`;
            sensors.push({ device_id, sensor_id });
        }
    }

    return sensors;
}
