# IoT Client

A TypeScript simulation client that generates and sends IoT device data to Google Cloud Pub/Sub. Part of the IoT data processing infrastructure.

## Features

- Simulates multiple IoT devices
- Configurable device count and sensor count
- Customizable data generation frequency
- Automatic authentication with GCP
- TypeScript implementation with Bun runtime
- Configurable error simulation

## Architecture

```mermaid
graph LR
    D[Device Simulator] --> PS[Pub/Sub]
    PS --> W[Worker]
    W --> BQ[BigQuery]
```

## Prerequisites

- Bun >= 1.2.2
- Google Cloud service account with necessary permissions:
  - `roles/pubsub.publisher`

## Configuration

Environment variables:
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

Application settings (in `src/index.ts`):
```typescript
const config = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    topicName: 'sensor-logs-topic',
    deviceCount: 3,           // Number of simulated devices
    sensorsPerDevice: 2,      // Sensors per device
    interval: 1000,           // Data generation interval (ms)
};
```

## Development

1. Install dependencies:
```bash
bun install
```

2. Set up service account:
```bash
# Create keys directory if it doesn't exist
mkdir -p keys

# Copy your service account key file
cp /path/to/service-account-key.json keys/
```

3. Run locally:
```bash
bun start
```

4. Run in development mode with hot reload:
```bash
bun dev
```

## Data Generation

The client generates simulated sensor data in the following format:
```typescript
interface SensorData {
    device_id: string;      // Format: device_{number}
    sensor_id: string;      // Format: sensor_{number}
    timestamp: string;      // ISO timestamp
    temperature: number;    // Range: 10-40°C
    humidity: number;      // Range: 30-80%
    voltage: number;       // Range: 11-13V
    error_code?: string;   // Random error simulation
    status: string;        // "normal" | "warning" | "error"
}
```

### Data Patterns

1. Normal Operation:
   - Temperature: 20-30°C
   - Humidity: 40-60%
   - Voltage: 12-12.5V
   - Status: "normal"

2. Warning Conditions:
   - Temperature: 30-35°C or 15-20°C
   - Humidity: 60-70% or 30-40%
   - Voltage: 11.5-12V or 12.5-13V
   - Status: "warning"

3. Error Conditions:
   - Temperature: >35°C or <15°C
   - Humidity: >70% or <30%
   - Voltage: <11.5V or >13V
   - Status: "error"
   - Error codes generated

## Performance Considerations

- Batched message publishing
- Configurable publishing intervals
- Memory-efficient data generation
- Connection pooling for Pub/Sub client

## Monitoring

The client logs important events:
- Connection status
- Message publishing results
- Error conditions
- Performance metrics

### Key Metrics

- Messages published per second
- Publishing latency
- Error rate
- Memory usage

## Error Handling

1. Connection Errors:
   - Automatic reconnection
   - Exponential backoff
   - Error logging

2. Publishing Errors:
   - Retry mechanism
   - Error reporting
   - Failed message logging

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Related Services

- [BigQuery Worker](../bigquery-worker/README.md) - Processes and stores the sensor data
- Main [Infrastructure](../../terraform/README.md) - Core infrastructure configuration

## License

MIT
