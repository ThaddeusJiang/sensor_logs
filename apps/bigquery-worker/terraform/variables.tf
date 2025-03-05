# 添加新的变量定义
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
  default     = "974746135323"
}
