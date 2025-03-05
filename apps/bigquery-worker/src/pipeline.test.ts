import { expect, test, describe } from "bun:test";
import { PubSub } from "@google-cloud/pubsub";
import { BigQuery } from "@google-cloud/bigquery";

describe("Pipeline Configuration", () => {
    test("PubSub client initialization", () => {
        const pubsub = new PubSub();
        expect(pubsub).toBeDefined();
    });

    test("BigQuery client initialization", () => {
        const bigquery = new BigQuery();
        expect(bigquery).toBeDefined();
    });
});

describe("Data Processing", () => {
    test("Message format validation", () => {
        const testData = {
            device_id: "device_1",
            sensor_id: "sensor_1",
            timestamp: new Date().toISOString(),
            temperature: 25.5,
            humidity: 60,
            voltage: 12.1,
            status: "normal"
        };

        expect(testData).toHaveProperty("device_id");
        expect(testData).toHaveProperty("sensor_id");
        expect(testData).toHaveProperty("timestamp");
    });
});
