output "bigquery_dataset" {
  value = google_bigquery_dataset.iot_data.dataset_id
}

output "pubsub_topic" {
  value = google_pubsub_topic.sensor_logs_topic.name
}

output "service_account_email" {
  value = google_service_account.sensor_logs_sa.email
}
