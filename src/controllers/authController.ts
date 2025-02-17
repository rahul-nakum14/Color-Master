import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import * as authService from "../services/authService";
import * as emailService from "../utils/emailService";
import axios from "axios";
import { config } from "../config/config";
import { OAuthProfile } from "../types/auth";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const { user, verificationToken } = await authService.createUser(username, email, password);
  await emailService.sendVerificationEmail(email, verificationToken);
  res.status(201).json({ message: "User created. Please check your email for verification." });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const usernameOrEmail = email || username;
  const { accessToken, refreshToken } = await authService.loginUser(usernameOrEmail, password);
  res.status(200).json({ accessToken, refreshToken });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  res.json({ message: "Email verified successfully." });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const { resetToken } = await authService.createPasswordResetToken(email);
  await emailService.sendPasswordResetEmail(email, resetToken);
  res.json({ message: "Password reset email sent." });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ message: "Password reset successfully." });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const newAccessToken = await authService.refreshAccessToken(refreshToken);
  res.json({ accessToken: newAccessToken });
});

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;
  const { user, accessToken, refreshToken } = await authService.handleGoogleAuth(code);
  res.json({ user, accessToken, refreshToken });
});

export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;
  const { user, accessToken, refreshToken } = await authService.handleFacebookAuth(code);
  res.json({ user, accessToken, refreshToken });
});