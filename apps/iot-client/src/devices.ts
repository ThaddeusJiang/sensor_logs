
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
