import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body;

  // Ensure password is provided
  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }

  // Check if either email or username is provided
  if (!email && !username) {
    return next(new ApiError(400, "Either email or username must be provided"));
  }

  // Validate email format if email is provided
  if (email) {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return next(new ApiError(400, "Invalid email format"));
    }
  }

  // Validate password length
  if (password.length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters long"));
  }

  next();
};
