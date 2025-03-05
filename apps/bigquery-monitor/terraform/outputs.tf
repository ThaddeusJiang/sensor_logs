output "pubsub_topic" {
  value = google_pubsub_topic.device_offline_alerts.name
}

output "pubsub_subscription" {
  value = google_pubsub_subscription.device_offline_alerts_sub.name
}

output "service_account_email" {
  value = data.google_service_account.sensor_logs_sa.email
}
