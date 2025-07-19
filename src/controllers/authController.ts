import type { Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import * as authService from "../services/authService"
import * as emailService from "../services/emailService"
import axios from "axios"
import { config } from "../config/config"
import { OAuthProfile } from "../types/auth"
import qs from 'qs'; 

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
  const { resetToken } = await authService.createPasswordResetToken(email); // Destructure resetToken
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


export const googleOAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Missing authorization code" });
  }

  const storedState = req.cookies["oauth_state"];
  if (!storedState) {
    return res.status(400).json({ message: "Missing stored OAuth state cookie" });
  }

  res.clearCookie("oauth_state");

  const profile = await authService.exchangeGoogleCodeForProfile(code);

  const { user, accessToken, refreshToken } = await authService.createOrUpdateOAuthUser(profile);

  res.json({
    user: {
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    accessToken,
    refreshToken,
  });
});

export const googleOAuthInitiate = (req: Request, res: Response) => {
  const state = crypto.randomUUID();

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: true, 
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, 
  });
 

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${config.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${config.GOOGLE_REDIRECT_URI}` +
    `&response_type=code&scope=profile email&state=${state}`;

  res.json({ url: googleAuthUrl });
};


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
    photo: facebookProfile.photo
  };

  const { user, accessToken, refreshToken } = await authService.createOrUpdateOAuthUser(profile);
  res.json({ user, accessToken, refreshToken });
});

