import {Router} from 'express'
import authRoutes from '../api/auth/auth.route'

const router = Router()

router.use('/users',authRoutes)

export default router