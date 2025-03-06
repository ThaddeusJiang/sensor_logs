import { PubSub } from '@google-cloud/pubsub';
import { AlertMessage } from './types';

const pubsub = new PubSub();
const subscriptionName = 'device-alerts-sub';

export async function startSubscriber() {
    const subscription = pubsub.subscription(subscriptionName);

    subscription.on('message', message => {
        try {
            const alertMessage: AlertMessage = JSON.parse(message.data.toString());

            // TODO: Implement alert notification logic
            console.log('Received device offline alert:', alertMessage);

            // Acknowledge message as processed
            message.ack();
        } catch (error) {
            console.error('Error processing alert message:', error);
            message.nack();
        }
    });

    subscription.on('error', error => {
        console.error('Subscription error:', error);
    });

    console.log('Alert subscription service started');
    
    // Return cleanup function
    return () => {
        console.log('Closing alert subscription');
        subscription.removeAllListeners();
    };
}
