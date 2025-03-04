terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}
# 配置 Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# 创建 BigQuery dataset
resource "google_bigquery_dataset" "iot_data" {
  dataset_id    = "iot_data"
  friendly_name = "IoT Data Dataset"
  description   = "Dataset for storing IoT sensor logs"
  location      = "US" # 可以根据需要修改位置

  delete_contents_on_destroy = true # 删除 dataset 时同时删除内容
}

# 创建 BigQuery table
resource "google_bigquery_table" "sensor_logs" {
  dataset_id = google_bigquery_dataset.iot_data.dataset_id
  table_id   = "sensor_logs"

  deletion_protection = false # 开发环境可以设置为 false，生产环境建议设置为 true

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }

  clustering = ["device_id"]

  schema = jsonencode([
    {
      name        = "device_id",
      type        = "STRING",
      mode        = "REQUIRED",
      description = "设备 ID"
    },
    {
      name        = "sensor_id",
      type        = "STRING",
      mode        = "REQUIRED",
      description = "传感器 ID"
    },
    {
      name        = "timestamp",
      type        = "TIMESTAMP",
      mode        = "REQUIRED",
      description = "数据时间"
    },
    {
      name        = "temperature",
      type        = "FLOAT64",
      mode        = "NULLABLE",
      description = "温度"
    },
    {
      name        = "humidity",
      type        = "FLOAT64",
      mode        = "NULLABLE",
      description = "湿度"
    },
    {
      name        = "voltage",
      type        = "FLOAT64",
      mode        = "NULLABLE",
      description = "电压"
    },
    {
      name        = "error_code",
      type        = "STRING",
      mode        = "NULLABLE",
      description = "故障代码"
    },
    {
      name        = "status",
      type        = "STRING",
      mode        = "NULLABLE",
      description = "设备状态（正常、警告、故障）"
    }
  ])
}

# 创建 Pub/Sub topic
resource "google_pubsub_topic" "sensor_logs_topic" {
  name = "sensor-logs-topic"
}

# 创建 Service Account 用于 Dataflow
resource "google_service_account" "dataflow_service_account" {
  account_id   = "dataflow-sa"
  display_name = "Dataflow Service Account"
  description  = "Service Account for Dataflow jobs"
}

# 为 Service Account 添加必要的权限
resource "google_project_iam_member" "dataflow_worker" {
  project = var.project_id
  role    = "roles/dataflow.worker"
  member  = "serviceAccount:${google_service_account.dataflow_service_account.email}"
}

resource "google_project_iam_member" "bigquery_data_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.dataflow_service_account.email}"
}

resource "google_project_iam_member" "pubsub_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.dataflow_service_account.email}"
}
