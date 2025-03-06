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
resource "google_bigquery_dataset" "sensor_data" {
  dataset_id    = "sensor_data"
  friendly_name = "Sensor Data Dataset"
  description   = "Dataset for storing sensor data"
  location      = "US" # 可以根据需要修改位置

  delete_contents_on_destroy = true # 删除 dataset 时同时删除内容
}

# 创建 BigQuery table
resource "google_bigquery_table" "sensor_logs" {
  dataset_id = google_bigquery_dataset.sensor_data.dataset_id
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

# 创建设备表
resource "google_bigquery_table" "sensors" {
  dataset_id = google_bigquery_dataset.sensor_data.dataset_id
  table_id   = "sensors"

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
      name        = "created_at",
      type        = "TIMESTAMP",
      mode        = "REQUIRED",
      description = "创建时间"
    },
    {
      name        = "updated_at",
      type        = "TIMESTAMP",
      mode        = "REQUIRED",
      description = "更新时间"
    },
    {
      name        = "status",
      type        = "STRING",
      mode        = "REQUIRED",
      description = "设备状态（active/inactive）"
    }
  ])
}


# 创建 Pub/Sub topic
resource "google_pubsub_topic" "sensor_logs_topic" {
  name = "sensor-logs-topic"
}

# 创建 Pub/Sub subscription
resource "google_pubsub_subscription" "sensor_logs_sub" {
  name  = "sensor-logs-sub-01"
  topic = google_pubsub_topic.sensor_logs_topic.name

  # 设置消息保留时间为 7 天
  message_retention_duration = "604800s"

  # 设置确认截止时间为 60 秒
  ack_deadline_seconds = 60

  # 启用死信队列
  dead_letter_policy {
    dead_letter_topic     = "projects/${var.project_id}/topics/${google_pubsub_topic.sensor_logs_dlq.name}"
    max_delivery_attempts = 5
  }

  # 重试策略
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

# 创建死信队列 topic
resource "google_pubsub_topic" "sensor_logs_dlq" {
  name = "sensor-logs-dlq"
}

# 创建死信队列 subscription
resource "google_pubsub_subscription" "sensor_logs_dlq_sub" {
  name  = "sensor-logs-dlq-sub"
  topic = google_pubsub_topic.sensor_logs_dlq.name

  message_retention_duration = "604800s"
  ack_deadline_seconds       = 60
}

# 创建 Service Account
resource "google_service_account" "sensor_logs_sa" {
  account_id   = "sensor-logs-sa"
  display_name = "IoT Data Processing Service Account"
  description  = "Service Account for IoT data processing (Pub/Sub and BigQuery)"
}

# 为服务账号添加项目级别的权限
resource "google_project_iam_member" "pubsub_viewer" {
  project = var.project_id
  role    = "roles/pubsub.viewer"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# 添加 Pub/Sub Admin 权限
resource "google_project_iam_member" "pubsub_admin" {
  project = var.project_id
  role    = "roles/pubsub.admin"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# 为 Service Account 添加 BigQuery 权限
resource "google_project_iam_member" "bigquery_data_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# GitHub Workload Identity Federation 配置
resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "github-pool-02"
  display_name              = "GitHub Actions Pool"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_condition = "attribute.repository == \"${var.github_org}/${var.github_repo}\""
}

# 允许 GitHub Actions 使用服务账号
resource "google_service_account_iam_member" "github_workload_identity" {
  service_account_id = google_service_account.sensor_logs_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_org}/${var.github_repo}"
}

# 创建 Artifact Registry 仓库
resource "google_artifact_registry_repository" "bigquery_worker" {
  project       = var.project_id
  location      = var.region
  repository_id = "bigquery-worker"
  format        = "DOCKER"
}

# 添加 Artifact Registry 权限
resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# 添加 Cloud Run 开发者权限
resource "google_project_iam_member" "cloud_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# 添加 Cloud Run Admin 权限
resource "google_project_iam_member" "cloud_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}

# 添加 Service Account User 权限
resource "google_project_iam_member" "service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.sensor_logs_sa.email}"
}
