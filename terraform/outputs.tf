output "bigquery_dataset" {
  value = google_bigquery_dataset.sensor_data.dataset_id
}

output "bigquery_tables" {
  value = {
    sensor_logs = google_bigquery_table.sensor_logs.table_id
    sensors     = google_bigquery_table.sensors.table_id
  }
}

output "service_account_email" {
  value = google_service_account.sensor_logs_sa.email
}

output "workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.bigquery_worker.name
}

output "pubsub_topics" {
  value = {
    sensor_logs_topic = google_pubsub_topic.sensor_logs_topic.name
    sensor_logs_dlq   = google_pubsub_topic.sensor_logs_dlq.name
  }
}

output "pubsub_subscriptions" {
  value = {
    sensor_logs_sub     = google_pubsub_subscription.sensor_logs_sub.name
    sensor_logs_dlq_sub = google_pubsub_subscription.sensor_logs_dlq_sub.name
  }
}


output "iam_members" {
  value = {
    pubsub_viewer            = google_project_iam_member.pubsub_viewer.member
    pubsub_admin             = google_project_iam_member.pubsub_admin.member
    bigquery_data_editor     = google_project_iam_member.bigquery_data_editor.member
    artifact_registry_writer = google_project_iam_member.artifact_registry_writer.member
    cloud_run_developer      = google_project_iam_member.cloud_run_developer.member
    cloud_run_admin          = google_project_iam_member.cloud_run_admin.member
    service_account_user     = google_project_iam_member.service_account_user.member
  }
}

output "workload_identity" {
  value = {
    pool_name     = google_iam_workload_identity_pool.github.name
    provider_name = google_iam_workload_identity_pool_provider.github.name
  }
}
