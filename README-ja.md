# IoT データ処理インフラストラクチャ

本プロジェクトは、インフラストラクチャの設定とシミュレーションクライアントを含む、完全な IoT データ処理ソリューションを提供します。Google Cloud Platform (GCP) 上にインフラストラクチャを構築するために Terraform を使用し、IoT デバイスデータをシミュレートするための TypeScript クライアントを提供します。

## コンポーネント

1. **インフラストラクチャ**
   - Terraform による GCP リソース管理
   - BigQuery、Pub/Sub、必要な IAM 設定を含む

2. **IoT シミュレーションクライアント (apps/iot-client)**
   - TypeScript アプリケーション
   - 複数の IoT デバイスをシミュレート
   - デバイス数と送信頻度の設定が可能

## アーキテクチャ概要

プロジェクトは以下の GCP リソースを作成・使用します：

1. **BigQuery データセットとテーブル**
   - データセット: `sensor_data`
   - テーブル: `sensor_logs`（日付でパーティション化、device_id でクラスタリング）
   - 処理済みセンサーデータの保存

2. **Cloud Pub/Sub**
   - トピック: `sensor-logs-topic`
   - サブスクリプション: `sensor-logs-sub-01`
   - デッドレターキュー: `sensor-logs-dlq`
   - リアルタイムセンサーデータの受信

3. **サービスアカウント**
   - クライアントアプリケーション
   - 必要な IAM 権限を含む

## データモデル

センサーデータテーブル構造：

| フィールド名 | 型 | モード | 説明 |
|------------|------|--------|------|
| device_id | STRING | REQUIRED | デバイス ID |
| sensor_id | STRING | REQUIRED | センサー ID |
| timestamp | TIMESTAMP | REQUIRED | データタイムスタンプ |
| temperature | FLOAT64 | NULLABLE | 温度 |
| humidity | FLOAT64 | NULLABLE | 湿度 |
| voltage | FLOAT64 | NULLABLE | 電圧 |
| error_code | STRING | NULLABLE | エラーコード |
| status | STRING | NULLABLE | デバイス状態 |

## クイックスタート

### インフラストラクチャのデプロイ

1. 前提条件のインストール：
   - [Terraform](https://developer.hashicorp.com/terraform/downloads)
   - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. GCP 認証の設定：
   ```bash
   gcloud auth application-default login
   ```

3. プロジェクトのクローンと移動：
   ```bash
   git clone https://github.com/your-repo/iot-data-processing.git
   cd iot-data-processing
   ```

4. `terraform.tfvars` の更新：
   ```hcl
   project_id = "your-project-id"
   region     = "asia-northeast1"
   ```

5. 初期化とデプロイ：
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

### クライアントのセットアップ

1. クライアントディレクトリへ移動：
   ```bash
   cd apps/iot-client
   ```

2. 依存関係のインストール：
   ```bash
   bun install
   ```

3. 環境変数の設定：
   ```bash
   cp .env.example .env
   # .env ファイルを編集して必要な設定を行う
   ```

4. クライアントの実行：
   ```bash
   bun start
   ```

## プロジェクト構造

```
.
├── README.md
├── main.tf           # Terraform メイン設定
├── variables.tf      # 変数定義
├── outputs.tf        # 出力定義
├── terraform.tfvars  # 変数値
├── apps/
│   ├── bigquery-worker/ # BigQuery データ処理ジョブ
│   └── iot-client/   # TypeScript シミュレーションクライアント
└── .gitignore
```

## パフォーマンス最適化

1. BigQuery テーブルの最適化：
   - 日付によるパーティション化（timestamp）
   - device_id によるクラスタリング
   - クエリパフォーマンスとコストの最適化

2. クライアントの最適化：
   - バッチメッセージ送信
   - 設定可能なリトライメカニズム
   - エラー処理とログ記録

## セキュリティ考慮事項

1. サービスアカウント権限：
   - 最小権限の原則に従う
   - 主な権限：
     - `roles/pubsub.publisher`
     - `roles/bigquery.dataEditor`

2. 認証：
   - サービスアカウントキーファイルを使用
   - 環境変数による設定をサポート

## バージョン要件

- Terraform >= 1.0
- Google Provider >= 6.8.0
- Node.js >= 16.0.0
- TypeScript >= 4.0.0

## リソースのクリーンアップ

作成したすべてのリソースを削除：
```bash
terraform destroy
```

## コントリビューション

Pull Requests を歓迎します！以下を確認してください：
1. プロジェクト規格に従ったコード
2. ドキュメントの更新
3. 必要なテストの追加

## ライセンス

MIT

## ドキュメント
- English: [README.md](README.md)
- 中文: [README-zh.md](README-zh.md)
- 日本語: README-ja.md (本ファイル)
