import amqp from "amqplib";
import { config } from "./config";

export let rabbitMQChannel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(config.RABBITMQ_URL);
  rabbitMQChannel = await connection.createChannel();
  await rabbitMQChannel.assertQueue("email-retry", { durable: true });
  await rabbitMQChannel.assertQueue("email-dlq", { durable: true });
};