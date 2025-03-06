output "pubsub_topic" {
  value = google_pubsub_topic.sensor_offline_alerts.name
}

output "pubsub_subscription" {
  value = google_pubsub_subscription.sensor_offline_alerts_sub.name
}

output "cloud_run_service" {
  value = {
    name = google_cloud_run_v2_service.bigquery_worker.name
    url  = google_cloud_run_v2_service.bigquery_worker.uri
  }
}

output "iam_members" {
  value = {
    bigquery_reader          = google_project_iam_member.bigquery_reader.member
    bigquery_job_user        = google_project_iam_member.bigquery_job_user.member
    pubsub_publisher         = google_project_iam_member.pubsub_publisher.member
    pubsub_subscriber        = google_project_iam_member.pubsub_subscriber.member
    artifact_registry_reader = google_project_iam_member.artifact_registry_reader.member
  }
}
