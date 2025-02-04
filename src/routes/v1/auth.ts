import express from "express"
import * as authController from "../../controllers/authController"
import { authValidation } from "../../validations/authValidation"
import {validate}  from "../../middleware/validate"

const router = express.Router()

router.post("/signup", validate(authValidation.signup), authController.signup)
router.post("/login", validate(authValidation.login), authController.login)
router.post("/forgot-password", validate(authValidation.forgotPassword), authController.forgotPassword)
router.get("/verify-email/:token", authController.verifyEmail)
router.post("/reset-password/:token", authController.resetPassword)
router.post("/refresh-token", authController.refreshToken)
router.post("/google", authController.googleAuth)
router.post("/facebook", authController.facebookAuth)

export default router

