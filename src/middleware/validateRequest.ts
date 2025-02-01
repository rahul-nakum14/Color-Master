import type { Request, Response, NextFunction } from "express"
import ApiError from "../utils/apiError"

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ApiError(400, "Username Email and password are required"))
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return next(new ApiError(400, "Invalid email format"))
  }

  if (password.length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters long"))
  }

  next()
}

