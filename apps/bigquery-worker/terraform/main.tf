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
# 引用已存在的服务账号
data "google_service_account" "sensor_logs_sa" {
  account_id = "sensor-logs-sa"
  project    = var.project_id
}

# 创建 Pub/Sub 主题
resource "google_pubsub_topic" "sensor_offline_alerts" {
  name = "sensor_offline"
}

# 创建 Pub/Sub 订阅
resource "google_pubsub_subscription" "sensor_offline_alerts_sub" {
  name  = "sensor_offline_sub01"
  topic = google_pubsub_topic.sensor_offline_alerts.name

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

resource "google_project_iam_member" "pubsub_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "bigquery_worker" {
  name     = "bigquery-worker"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/sensor-logs/bigquery-worker:latest"

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }

      env {
        name  = "PUBSUB_TOPIC"
        value = google_pubsub_topic.sensor_offline_alerts.name
      }

      env {
        name  = "PUBSUB_SUBSCRIPTION"
        value = google_pubsub_subscription.sensor_offline_alerts_sub.name
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
        startup_cpu_boost = true
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    service_account = data.google_service_account.sensor_logs_sa.email
  }
}

# Artifact Registry 权限
resource "google_project_iam_member" "artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}
