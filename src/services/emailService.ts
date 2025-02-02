import nodemailer from "nodemailer";
import logger from "../config/logger";
import { config } from "../config/config"; 

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
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};


export const sendPasswordResetEmail = async (to: string, token: string) => {

  const resetUrl =   `${config.APP_URL}/api/v1/auth/reset-password/${token}`

  const mailOptions = {
    from: config.SMTP_USER,
    to,
    subject: "Reset Your Password",
    html: `Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info(`Password reset email sent to ${to}`)
  } catch (error) {
    logger.error("Error sending password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

