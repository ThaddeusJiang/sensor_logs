# IoT 数据处理基础设施

本项目提供了一个完整的 IoT 数据处理解决方案，包括基础设施配置和模拟客户端。使用 Terraform 在 Google Cloud Platform (GCP) 上创建基础设施，并提供 TypeScript 客户端用于模拟 IoT 设备数据。

## 项目组件

1. **基础设施**
   - 使用 Terraform 管理 GCP 资源
   - 包含 BigQuery、Pub/Sub 和必要的 IAM 配置

2. **IoT 模拟客户端 (apps/iot-client)**
   - TypeScript 应用程序
   - 模拟多个 IoT 设备发送数据
   - 支持配置设备数量和发送频率

## 架构概述

项目创建和使用以下 GCP 资源：

1. **BigQuery Dataset 和表**
   - Dataset: `iot_data`
   - 表: `sensor_logs`（按天分区，按 device_id 聚类）
   - 用于存储处理后的传感器数据

2. **Cloud Pub/Sub**
   - 主题: `sensor-logs-topic`
   - 用于接收实时传感器数据

3. **服务账号**
   - 用于客户端应用程序和 Dataflow 作业
   - 包含必要的 IAM 权限

## 数据模型

传感器数据表结构：

| 字段名 | 类型 | 模式 | 描述 |
|--------|------|------|------|
| device_id | STRING | REQUIRED | 设备 ID |
| sensor_id | STRING | REQUIRED | 传感器 ID |
| timestamp | TIMESTAMP | REQUIRED | 数据时间 |
| temperature | FLOAT64 | NULLABLE | 温度 |
| humidity | FLOAT64 | NULLABLE | 湿度 |
| voltage | FLOAT64 | NULLABLE | 电压 |
| error_code | STRING | NULLABLE | 故障代码 |
| status | STRING | NULLABLE | 设备状态 |

## 快速开始

### 基础设施部署

1. 安装前置条件：
   - [Terraform](https://developer.hashicorp.com/terraform/downloads)
   - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. 配置 GCP 认证：
   ```bash
   gcloud auth application-default login
   ```

3. 克隆项目并进入目录：
   ```bash
   git clone https://github.com/your-repo/iot-data-processing.git
   cd iot-data-processing
   ```

4. 更新 `terraform.tfvars`：
   ```hcl
   project_id = "your-project-id"
   region     = "asia-northeast1"
   ```

5. 初始化并部署：
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

### 客户端设置

1. 进入客户端目录：
   ```bash
   cd apps/iot-client
   ```

2. 安装依赖：
   ```bash
   bun install
   ```

3. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件设置必要的配置
   ```

4. 运行客户端：
   ```bash
   bun start
   ```

## 项目结构

```
.
├── README.md
├── main.tf           # Terraform 主配置
├── variables.tf      # 变量定义
├── outputs.tf        # 输出定义
├── terraform.tfvars  # 变量值
├── apps/
│   ├── bigquery-worker/ # BigQuery 数据处理作业
│   └── iot-client/   # TypeScript 模拟客户端
└── .gitignore
```

## 性能优化

1. BigQuery 表优化：
   - 按天分区（timestamp）
   - 按 device_id 聚类
   - 优化查询性能和成本

2. 客户端优化：
   - 批量发送消息
   - 可配置的重试机制
   - 错误处理和日志记录

## 安全考虑

1. 服务账号权限：
   - 遵循最小权限原则
   - 主要权限：
     - `roles/pubsub.publisher`
     - `roles/bigquery.dataEditor`

2. 认证：
   - 使用服务账号密钥文件
   - 支持环境变量配置

## 版本要求

- Terraform >= 1.0
- Google Provider >= 6.8.0
- Node.js >= 16.0.0
- TypeScript >= 4.0.0

## 清理资源

删除所有创建的资源：
```bash
terraform destroy
```

## 贡献指南

欢迎提交 Pull Requests！请确保：
1. 代码符合项目规范
2. 更新相关文档
3. 添加必要的测试

## 许可证

MIT

## 文档
- English: [README.md](README.md)
- 中文: README-zh.md (本文件)
- 日本語: [README-ja.md](README-ja.md)
