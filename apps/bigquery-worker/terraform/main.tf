# 引用已存在的服务账号
data "google_service_account" "sensor_logs_sa" {
  account_id = "sensor-logs-sa"
  project    = var.project_id
}

# Artifact Registry 仓库
resource "google_artifact_registry_repository" "worker" {
  project       = var.project_id
  location      = var.region
  repository_id = "bigquery-worker"
  format        = "DOCKER"
}

# Cloud Run Job
resource "google_cloud_run_v2_job" "worker" {
  project  = var.project_id
  name     = "bigquery-worker"
  location = var.region

  template {
    template {
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

      service_account = data.google_service_account.sensor_logs_sa.email
    }
  }

  lifecycle {
    prevent_destroy = false
  }
  deletion_protection = false
}

# IAM 配置
resource "google_cloud_run_v2_job_iam_member" "worker_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_job.worker.location
  name     = google_cloud_run_v2_job.worker.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${data.google_service_account.sensor_logs_sa.email}"
}

# Workload Identity Federation 配置
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
  service_account_id = data.google_service_account.sensor_logs_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_org}/${var.github_repo}"
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
