import { PubSub } from '@google-cloud/pubsub';
import { resolve } from 'path';

async function verifySetup() {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
    }

    console.log('Credentials path:', credentialsPath);
    console.log('Absolute path:', resolve(credentialsPath));

    const pubsub = new PubSub({
        projectId: 'dev-iot-452706'
    });

    try {
        const [topics] = await pubsub.getTopics();
        console.log('Authentication successful');
        console.log('Available topics:', topics.map(t => t.name));
    } catch (error) {
        console.error('Authentication failed:', error);
        process.exit(1);
    }
}

verifySetup().catch(console.error);
