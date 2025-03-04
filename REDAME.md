# IoT 数据处理基础设施

本项目使用 Terraform 在 Google Cloud Platform (GCP) 上创建用于 IoT 数据处理的基础设施。

## 架构概述

项目创建以下 GCP 资源：

1. **BigQuery Dataset & Table**
   - Dataset: `iot_data`
   - Table: `sensor_logs`（按天分区，按 device_id 聚类）
   - 用于存储处理后的传感器数据

2. **Cloud Pub/Sub**
   - Topic: `sensor-logs-topic`
   - 用于接收实时传感器数据

3. **Service Account**
   - 用于 Dataflow 作业的服务账号
   - 包含必要的 IAM 权限

## 数据模型

传感器数据表结构如下：

| 字段名 | 类型 | 模式 | 描述 |
|--------|------|------|------|
| device_id | STRING | REQUIRED | 设备 ID |
| sensor_id | STRING | REQUIRED | 传感器 ID |
| timestamp | TIMESTAMP | REQUIRED | 数据时间 |
| temperature | FLOAT64 | NULLABLE | 温度 |
| humidity | FLOAT64 | NULLABLE | 湿度 |
| voltage | FLOAT64 | NULLABLE | 电压 |
| error_code | STRING | NULLABLE | 故障代码 |
| status | STRING | NULLABLE | 设备状态（正常、警告、故障）|

## 前置条件

1. 安装 [Terraform](https://developer.hashicorp.com/terraform/downloads)
2. 配置 [GCP 认证](https://cloud.google.com/docs/authentication/getting-started)
3. 启用必要的 GCP API：
   - BigQuery API
   - Cloud Pub/Sub API
   - Dataflow API
   - IAM API

## 配置说明

1. 克隆项目：
   ```bash
   git clone https://github.com/your-repo/iot-data-processing.git
   cd iot-data-processing
   ```

2. 更新配置文件：
   - `terraform.tfvars`: 设置项目 ID 和区域
   ```hcl
   project_id = "dev-iot-452706"
   region     = "asia-northeast1"
   ```

3. 初始化 Terraform：
```bash
terraform init
```

4. 检查计划：
```bash
terraform plan
```

5. 应用配置：
```bash
terraform apply
```

## 性能优化

1. BigQuery 表已配置：
   - 按天分区（field: timestamp）
   - 按 device_id 聚类
   - 优化查询性能和成本

## 注意事项

1. 开发环境配置：
   - `deletion_protection = false`：允许删除表
   - 生产环境建议设置为 `true`

2. 安全考虑：
   - 服务账号权限遵循最小权限原则
   - 已配置的权限：
     - `roles/dataflow.worker`
     - `roles/bigquery.dataEditor`
     - `roles/pubsub.subscriber`

## 清理资源

删除所有创建的资源：
```bash
terraform destroy
```

## 项目结构

```
.
├── README.md
├── main.tf           # 主要的 Terraform 配置
├── variables.tf      # 变量定义
├── outputs.tf        # 输出定义
├── terraform.tfvars  # 变量值配置
└── .gitignore       # Git 忽略文件
```

## 输出值

执行 `terraform apply` 后，将输出以下信息：
- BigQuery dataset ID
- Pub/Sub topic 名称
- Service Account 邮箱地址

## 版本要求

- Terraform >= 1.0
- Google Provider 6.8.0
