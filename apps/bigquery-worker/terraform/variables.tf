# 添加新的变量定义
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

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "dev-iot-452706"
}

variable "project_number" {
  description = "GCP project number"
  type        = string
}
