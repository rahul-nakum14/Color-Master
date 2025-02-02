import express from "express"
import * as authController from "../../controllers/authController"
import { validateRequest } from "../../middleware/validateRequest"

const router = express.Router()

router.post("/signup", validateRequest, authController.signup)
router.post("/login", validateRequest, authController.login)
router.get("/verify-email/:token", authController.verifyEmail)
router.post("/forgot-password", validateRequest, authController.forgotPassword)
router.post("/reset-password/:token", validateRequest, authController.resetPassword)
router.post("/refresh-token", validateRequest, authController.refreshToken)
router.post("/google", authController.googleAuth)
router.post("/facebook", authController.facebookAuth)

export default router

