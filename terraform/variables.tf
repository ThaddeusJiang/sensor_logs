variable "project_id" {
  description = "GCP 项目 ID"
  type        = string
  default     = "dev-iot-452706"
}

variable "region" {
  description = "GCP 区域"
  type        = string
  default     = "asia-northeast1"
}

variable "github_org" {
  description = "GitHub organization name"
  type        = string
  default     = "ThaddeusJiang"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "sensor_logs"
}
