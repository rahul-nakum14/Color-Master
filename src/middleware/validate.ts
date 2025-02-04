import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";
import ApiError from "../utils/apiError";

export const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(({ message }) => message).join(", ");
    return next(new ApiError(400, errorMessage));
  }

  next();
};
