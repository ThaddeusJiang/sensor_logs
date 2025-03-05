export function fetchSensors() {
    const mock = {
        deviceCount: 3,
        sensorsPerDevice: 2,
    }
    const sensors: Array<{ deviceId: string, sensorId: string }> = [];

    for (let deviceNum = 1; deviceNum <= mock.deviceCount; deviceNum++) {
        const deviceId = `device-${deviceNum.toString().padStart(6, '0')}`;

        for (let sensorNum = 1; sensorNum <= mock.sensorsPerDevice; sensorNum++) {
            const sensorId = `sensor-${sensorNum.toString().padStart(10, '0')}`;
            sensors.push({ deviceId, sensorId });
        }
    }

    return sensors;
}
