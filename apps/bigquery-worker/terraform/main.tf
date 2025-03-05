# 引用已存在的服务账号
data "google_service_account" "sensor_logs_sa" {
  account_id = "sensor-logs-sa"
  project    = var.project_id
}

# Cloud Run Service
resource "google_cloud_run_service" "worker" {
  project  = var.project_id
  name     = "bigquery-worker"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/bigquery-worker/worker:latest"

        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }

      service_account_name = data.google_service_account.sensor_logs_sa.email
    }
  }

  lifecycle {
    prevent_destroy = false
  }
}

# 添加 Artifact Registry 权限
resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# 添加 Cloud Run 开发者权限
resource "google_project_iam_member" "cloud_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# 添加 Service Account User 权限
resource "google_project_iam_member" "service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# 添加 Cloud Run Admin 权限
resource "google_project_iam_member" "cloud_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}
