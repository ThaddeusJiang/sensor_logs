# IoT Data Processing Infrastructure

This project provides a complete IoT data processing solution, including infrastructure configuration and simulation clients. It uses Terraform to create infrastructure on Google Cloud Platform (GCP) and provides a TypeScript client for simulating IoT device data.

## Components

1. **Infrastructure**
   - GCP resources managed with Terraform
   - Includes BigQuery, Pub/Sub, and necessary IAM configurations

2. **IoT Simulation Client (apps/iot-client)**
   - TypeScript application
   - Simulates multiple IoT devices
   - Configurable device count and transmission frequency

## Architecture Overview

The project creates and uses the following GCP resources:

1. **BigQuery Dataset & Table**
   - Dataset: `iot_data`
   - Table: `sensor_logs` (partitioned by day, clustered by device_id)
   - Stores processed sensor data

2. **Cloud Pub/Sub**
   - Topic: `sensor-logs-topic`
   - Receives real-time sensor data

3. **Service Account**
   - Used for client applications
   - Includes necessary IAM permissions for Pub/Sub and BigQuery

## Data Model

Sensor data table structure:

| Field Name | Type | Mode | Description |
|------------|------|------|-------------|
| device_id | STRING | REQUIRED | Device ID |
| sensor_id | STRING | REQUIRED | Sensor ID |
| timestamp | TIMESTAMP | REQUIRED | Data timestamp |
| temperature | FLOAT64 | NULLABLE | Temperature |
| humidity | FLOAT64 | NULLABLE | Humidity |
| voltage | FLOAT64 | NULLABLE | Voltage |
| error_code | STRING | NULLABLE | Error code |
| status | STRING | NULLABLE | Device status |

## Quick Start

### Infrastructure Deployment

1. Install prerequisites:
   - [Terraform](https://developer.hashicorp.com/terraform/downloads)
   - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. Configure GCP authentication:
   ```bash
   gcloud auth application-default login
   ```

3. Clone and enter the project:
   ```bash
   git clone https://github.com/your-repo/iot-data-processing.git
   cd iot-data-processing
   ```

4. Update `terraform.tfvars`:
   ```hcl
   project_id = "your-project-id"
   region     = "asia-northeast1"
   ```

5. Initialize and deploy:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

### Client Setup

1. Enter client directory:
   ```bash
   cd apps/iot-client
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env file with necessary configurations
   ```

4. Run client:
   ```bash
   bun start
   ```

## Project Structure

```
.
├── README.md
├── main.tf           # Main Terraform configuration
├── variables.tf      # Variable definitions
├── outputs.tf        # Output definitions
├── terraform.tfvars  # Variable values
├── apps/
│   ├── bigquery-worker/ # BigQuery data processing jobs
│   └── iot-client/   # TypeScript simulation client
└── .gitignore
```

## Performance Optimization

1. BigQuery Table Optimization:
   - Daily partitioning (timestamp)
   - Clustering by device_id
   - Query performance and cost optimization

2. Client Optimization:
   - Batch message sending
   - Configurable retry mechanism
   - Error handling and logging

## Security Considerations

1. Service Account Permissions:
   - Follows principle of least privilege
   - Main permissions:
     - `roles/pubsub.publisher`
     - `roles/bigquery.dataEditor`

2. Authentication:
   - Uses service account key files
   - Supports environment variables

## Version Requirements

- Terraform >= 1.0
- Google Provider >= 6.8.0
- Node.js >= 16.0.0
- TypeScript >= 4.0.0

## Resource Cleanup

To delete all created resources:
```bash
terraform destroy
```

## Contributing

Pull Requests are welcome! Please ensure:
1. Code follows project standards
2. Documentation is updated
3. Tests are added as needed

## License

MIT

## Documentation
- English: README.md (this file)
- 中文: [README-zh.md](README-zh.md)
- 日本語: [README-ja.md](README-ja.md)
