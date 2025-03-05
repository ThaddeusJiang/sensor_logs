output "bigquery_dataset" {
  value = google_bigquery_dataset.sensor_data.dataset_id
}

output "pubsub_topic" {
  value = google_pubsub_topic.sensor_logs_topic.name
}

output "service_account_email" {
  value = google_service_account.sensor_logs_sa.email
}

output "workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "artifact_registry_repository" {
  value       = "bigquery-worker"
  description = "Name of the Artifact Registry repository"
}
