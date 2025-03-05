# 1. 项目概述

开发一个接收 30万台充电桩数据的服务，并进行数据分析和处理。

项目目标：

- [x] 近似实时的接收 30万台充电桩数据
- [ ] 实现 IoT 设备的监控，如果设备离线或异常，进行告警。
  <!-- - [ ] 地图展示设备 -->

# 2. 项目结构

# 3. 项目实现

## 技术选型

- Google Cloud Platform
- 语言：TypeScript
- 使用 terraform 管理基础设施
<!-- - 框架：NestJS
- 数据库：PostgreSQL
- 缓存：Redis
- 消息队列：Cloud Pub/Sub
- 监控：Google Cloud Monitoring
- 日志：Google Cloud Logging -->

思路：

1. IoT 设备数据通过 MQTT 协议发送数据，然后通过 Google Cloud Pub/Sub 接收数据，然后进行数据分析和处理。
2. 处理数据，批量插入到 BigQuery 中。

# 4. 项目测试



# 5. 项目总结
