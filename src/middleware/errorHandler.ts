import type { Request, Response, NextFunction } from "express"
import ApiError from "../utils/apiError"
import logger from "../config/logger"
import { config } from "../config/config"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    })
  } else {
    logger.error(err)
    res.status(500).json({
      message: "Internal server error",
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    })
  }
}

