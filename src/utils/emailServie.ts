import nodemailer from "nodemailer";
import logger from "../config/logger";
import { config } from "../config/config";
import { rabbitMQChannel } from "../config/rabbitmq";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${config.APP_URL}/api/v1/auth/verify-email/${token}`;

  const mailOptions = {
    from: config.SMTP_USER,
    to,
    subject: "Verify Your Email",
    html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await rabbitMQChannel.sendToQueue("email-sennd", Buffer.from(JSON.stringify({ to, token })));

    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending verification email:", error);
    // Publish to RabbitMQ for retry
    await rabbitMQChannel.sendToQueue("email-retry", Buffer.from(JSON.stringify({ to, token })));
  }
};

// Other methods remain unchanged