terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 引用已存在的服务账号
data "google_service_account" "sensor_logs_sa" {
  account_id = "sensor-logs-sa"
  project    = var.project_id
}

# 创建 Pub/Sub 主题
resource "google_pubsub_topic" "device_offline_alerts" {
  name = "device-offline-alerts"
}

# 创建 Pub/Sub 订阅
resource "google_pubsub_subscription" "device_offline_alerts_sub" {
  name  = "device-offline-alerts-sub"
  topic = google_pubsub_topic.device_offline_alerts.name

  # 消息保留7天
  message_retention_duration = "604800s"

  # 确认截止时间
  ack_deadline_seconds = 20

  # 重试策略
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  # 过期消息策略
  expiration_policy {
    ttl = "604800s"
  }
}

# 添加必要的权限
resource "google_project_iam_member" "bigquery_reader" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# 添加 BigQuery Job User 权限
resource "google_project_iam_member" "bigquery_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

resource "google_project_iam_member" "pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}
