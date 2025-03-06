import { AlertMessage } from './types';

export async function sendAlert(alert: AlertMessage): Promise<void> {
    // 1. 保存告警记录到数据库
    // await saveAlertToDatabase(alert);

    // 2. 发送通知（可以支持多种通知方式）
    await Promise.all([
        // sendEmailNotification(alert),
        // sendSmsNotification(alert),
        // sendWebhookNotification(alert)
        sendSlackNotification(alert)
    ]);
}

async function sendEmailNotification(alert: AlertMessage): Promise<void> {
    // 实现邮件通知逻辑
    console.log(`发送邮件通知: device_id: ${alert.device_id} sensor_id: ${alert.sensor_id}`);
}

async function sendSmsNotification(alert: AlertMessage): Promise<void> {
    // 实现短信通知逻辑
    console.log(`发送短信通知: device_id: ${alert.device_id} sensor_id: ${alert.sensor_id}`);
}

async function sendWebhookNotification(alert: AlertMessage): Promise<void> {
    // 实现 Webhook 通知逻辑
    console.log(`发送 Webhook 通知: device_id: ${alert.device_id} sensor_id: ${alert.sensor_id}`);
}

async function sendSlackNotification(alert: AlertMessage): Promise<void> {

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) {
        console.error('SLACK_WEBHOOK_URL is not configured');
        return;
    }
    const payload = {
        text: `device_id: ${alert.device_id} sensor_id: ${alert.sensor_id} ${alert.message}`
    };
    const response = await fetch(slackUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        console.error('Send Slack Notification Failed', response.statusText);
        return;
    }
    console.log('Send Slack Notification Success');
}
