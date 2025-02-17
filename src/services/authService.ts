import jwt from "jsonwebtoken"
import crypto from "crypto"
import User, { type IUser } from "../models/User"
import ApiError from "../utils/apiError"
import { config } from "../config/config"
import { AuthResponse, OAuthProfile } from "../types/auth"
import { kafkaProducer } from "../config/kafka";
import redisClient from "../config/redis";
import axios from "axios"

export const createUser = async (
  username: string,
  email: string,
  password: string
): Promise<{ user: IUser; verificationToken: string }> => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(400, "Email already in use");
    }
    if (existingUser.username === username) {
      throw new ApiError(400, "Username already in use");
    }
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    username,
    email,
    password,
    verificationToken,
    verificationTokenExpires,
  });

  // Publish event to Kafka
  await kafkaProducer.send({
    topic: "user-signup",
    messages: [{ value: JSON.stringify({ email, verificationToken }) }],
  });

  // Cache user data in Redis
  await redisClient.set(`user:${user.id}`, JSON.stringify(user), { EX: 3600 });

  return { user, verificationToken };
};

export const loginUser = async (
  usernameOrEmail: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!password || !usernameOrEmail) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail.toLowerCase() }, { username: usernameOrEmail }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid username/email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
};

export const createPasswordResetToken = async (email: string): Promise<{ resetToken: string }> => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const resetToken = crypto.randomBytes(20).toString("hex")
  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
  await user.save()

  return { resetToken: resetToken };
}

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    return { accessToken: generateAccessToken(user) };
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
};

export const createOrUpdateOAuthUser = async (profile: OAuthProfile): Promise<AuthResponse> => {
  const { email, id, provider } = profile;

  let user = await User.findOne({ [`oauthProviders.${provider}`]: id });

  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    user.oauthProviders[provider] = id;
    user.isVerified = true;
    await user.save();
  } else {
    user = await User.create({
      email,
      oauthProviders: { [provider]: id },
      isVerified: true,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

const generateAccessToken = (user: IUser) => {
  return jwt.sign({ id: user._id },config.JWT_SECRET as string, {
    expiresIn: "15m",
  })
}

const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    {
      id: user._id,
    },
    config.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  )
}

export const handleGoogleAuth = async (code: string) => {
  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
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

  return await createOrUpdateOAuthUser(profile);
};

export const handleFacebookAuth = async (code: string) => {
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

  return await createOrUpdateOAuthUser(profile);
};