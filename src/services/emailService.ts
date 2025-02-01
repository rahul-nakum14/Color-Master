import nodemailer from "nodemailer"
import logger from "../config/logger"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `https://3000-rahulnakum1-colormaster-zw1gltut44w.ws-us117.gitpod.io/verify-email/${token}`
  console.log({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  });
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: "Verify Your Email",
    html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info(`Verification email sent to ${to}`)
  } catch (error) {
    logger.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `http://https://3000-rahulnakum1-colormaster-zw1gltut44w.ws-us117.gitpod.io/reset-password/${token}`

  const mailOptions = {
    from: process.env.SMTP_USER,
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

