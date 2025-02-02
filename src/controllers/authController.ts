import type { Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import * as authService from "../services/authService"
import * as emailService from "../services/emailService"
import axios from "axios"
import type { OAuthProfile } from "../services/authService"
import { config } from "../config/config"

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body
  const { user, verificationToken } = await authService.createUser(username, email, password)
  await emailService.sendVerificationEmail(email, verificationToken)
  res.status(201).json({ message: "User created. Please check your email for verification." })
})

export const login = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const usernameOrEmail = email || username;
  const { accessToken, refreshToken } = await authService.loginUser(usernameOrEmail, password);
  res.status(200).json({ accessToken, refreshToken });
});


export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params
  await authService.verifyEmail(token)
  res.json({ message: "Email verified successfully." })
})

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body
  const resetToken = await authService.createPasswordResetToken(email)
  await emailService.sendPasswordResetEmail(email, resetToken)
  res.json({ message: "Password reset email sent." })
})

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params
  const { password } = req.body
  await authService.resetPassword(token, password)
  res.json({ message: "Password reset successfully." })
})

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  const newAccessToken = await authService.refreshAccessToken(refreshToken)
  res.json({ accessToken: newAccessToken })
})

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;

  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret:config.GOOGLE_CLIENT_SECRET,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const { access_token } = data;
  const { data: googleProfile } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const profile: OAuthProfile = {
    id: googleProfile.id,
    email: googleProfile.email,
    provider: "google",
  };

  const { user, accessToken, refreshToken } = await authService.createOrUpdateOAuthUser(profile);
  res.json({ user, accessToken, refreshToken });
});

export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;

  const { data } = await axios.get("https://graph.facebook.com/v12.0/oauth/access_token", {
    params: {
      client_id: config.FACEBOOK_APP_ID,
      client_secret: config.FACEBOOK_APP_SECRET,
      redirect_uri: config.FACEBOOK_REDIRECT_URI,
      code,
    },
  });

  const { access_token } = data;
  const { data: facebookProfile } = await axios.get("https://graph.facebook.com/me", {
    params: { fields: "id,email", access_token },
  });

  const profile: OAuthProfile = {
    id: facebookProfile.id,
    email: facebookProfile.email,
    provider: "facebook",
  };

  const { user, accessToken, refreshToken } = await authService.createOrUpdateOAuthUser(profile);
  res.json({ user, accessToken, refreshToken });
});

