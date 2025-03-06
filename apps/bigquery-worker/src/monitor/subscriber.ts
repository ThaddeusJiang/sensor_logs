import { PubSub } from '@google-cloud/pubsub';
import { AlertMessage } from './types';

import { sendAlert } from './alert';
import { Topics } from './topics';

const pubsub = new PubSub();

export async function subscribeSensorOffline() {
    const subscription_name = Topics.sensor_offline.subscription

    const subscription = pubsub.subscription(subscription_name);

    subscription.on('message', message => {
        try {
            const alertMessage: AlertMessage = JSON.parse(message.data.toString());
            sendAlert(alertMessage);

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

    console.log(`Listening for messages on ${subscription_name}`);

    // Return cleanup function
    return () => {
        console.log(`Closing subscription: ${subscription_name}`);
        subscription.removeAllListeners();
    };
}
