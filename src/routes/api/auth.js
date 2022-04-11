const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authentications')
const validate = require('../../middlewares/validate')
const auth = require('../../middlewares/authenticate')
const {register, login, resendOTP, verifyEmail} = require('../../validations/authentications')

router.post('/register', validate(register), authController.register)
router.post('/login', validate(login), authController.login)
router.post('/resend-code', validate(resendOTP), authController.resendEmail)
router.post('/verify-email', validate(verifyEmail), authController.verifyEmail)

module.exports = router
