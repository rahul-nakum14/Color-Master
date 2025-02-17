import { Kafka } from "kafkajs";
import { config } from "./config";

const kafka = new Kafka({
  clientId: "user-service",
  brokers: [config.KAFKA_BROKER],
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: "email-service" });

export const connectKafka = async () => {
  await kafkaProducer.connect();
  await kafkaConsumer.connect();
};