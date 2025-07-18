import type { IUser } from "../models/User"

export interface OAuthProfile {
  id: string
  email: string
  provider: "google" | "facebook",
  photo: string
}

export interface AuthResponse {
  user: IUser
  accessToken: string
  refreshToken: string
}

