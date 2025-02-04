import Joi from "joi";

const password = Joi.string()
  .min(8)
  .required()
  .messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required.",
  });

const email = Joi.string()
  .email()
  .required()
  .messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  });

const username = Joi.string()
  .alphanum()
  .min(3)
  .max(30)
  .required()
  .messages({
    "string.empty": "Username is required.",
    "string.alphanum": "Username must only contain alphanumeric characters.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username cannot exceed 30 characters.",
    "any.required": "Username is required.",
  });

export const authValidation = {
  signup: Joi.object({
    email,
    username,
    password,
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .messages({
        "string.email": "Please enter a valid email address.",
      }),
    username: Joi.string().messages({
      "string.empty": "Username cannot be empty.",
    }),
    password: password,
  })
    .xor("email", "username")
    .messages({
      "object.missing": "Either email or username is required.",
    }),

  forgotPassword: Joi.object({
    email,
  }),
};
