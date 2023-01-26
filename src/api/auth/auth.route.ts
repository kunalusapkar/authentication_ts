import { Router } from "express";

import * as controller from "../auth/auth.controller"

const router = Router()

router.route('/').get(
    controller.getUsers
).post(
    controller.createUser
)
router.route('/login').post
(controller.login)

router.route('/post').get(controller.protectRoutes,controller.post)
router.route('/email_confirmation/:activation_code').get(controller.confirmUser)
router.route('/forgot_password').post(controller.forgotPassword)
router.route('/reset_password/:password_token').post(controller.resetPassword)
router.route('/me').get(controller.userData)

export default router