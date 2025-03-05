import { PubSub } from '@google-cloud/pubsub';
import { AlertMessage } from './types';

const pubsub = new PubSub();
const subscriptionName = 'device-alerts-sub';

export async function startSubscriber() {
    const subscription = pubsub.subscription(subscriptionName);

    subscription.on('message', message => {
        try {
            const alertMessage: AlertMessage = JSON.parse(message.data.toString());

            // TODO: 实现告警发送逻辑
            console.log('收到设备离线告警:', alertMessage);

            // 确认消息已处理
            message.ack();
        } catch (error) {
            console.error('处理告警消息时发生错误:', error);
            message.nack();
        }
    });

    subscription.on('error', error => {
        console.error('订阅发生错误:', error);
    });

    console.log('告警订阅服务已启动');
}
