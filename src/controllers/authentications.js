const moment = require('moment')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Verification = require('../models/verification')
const responseHandler = require('../utils/response')


/**
 * 
 * @param {email, password} req 
 * @param {*} res 
 * @returns 
 * @method POST
 */
exports.register = async(req, res) => {
    const {email, password} = req.body
    try {
        const passwordHash = User.getHashPassword(password)
        let user = await User.create({email, password: passwordHash})
        //create a verification code
        const otp = await User.getOTP()
        await Verification.create({
            user: user.id, code: otp, account, type: 'account_verification', expired_at: moment().add(1, 'hour')
        })

        //create a notofication and publish it to the queue
        return responseHandler.sendSuccess(res, {
            message: 'Account created successfully.',
            data: user
        })
    } catch(e) {
        return responseHandler.internalServerError(e)
    }
}

exports.verifyEmail = async (req, res) => {
    const {otp, email} = req.body
    try {
        const verification = await Verification.findOne({code: otp, email}).exec()
        if (verification && verification.status !== 'used') {
            const update = {
                account_verified: true, account_verified_at: new Date(), status: 'active',
            }
            const user = await User.findByIdAndUpdate(verification.user, update, {new: true, projection: '-password'}).exec()
            if (user) {
                await verification.update({status: 'used',})
                return responseHandler.sendSuccess(res, {
                    message: 'Account verified successfully',
                    data: {
                        user,
                        access_token: User.generateToken({id: user.id}),
                        refresh_token: User.generateToken({id: user.id})
                    }
                })
            }
        }
        return responseHandler.sendError(res, {
            message: 'Invalid otp.'
        })
    } catch(e) {
        return responseHandler.internalServerError(e)
    }
}

exports.resendEmail = async (req, res) => {
    const {email} = req.body
    try {
        const query = {email: email}
        const user = await User.findOne(query).lean()

        if (user.account_verified === true) {
            return responseHandler.sendError(res, {
                message: 'Account Already Verified.',
                status: 401
            })
        }
        if (user) {
            const otp = await User.getOTP()
            await Verification.findOneAndUpdate({user: user._id, type: 'account_verification'}, {
                user: user.id,
                status: 'unused',
                code: otp, expired_at: moment().add(1, 'hour'), email, type: 'account_verification'
            }, {upsert: true}).exec()
        }
        return responseHandler.sendSuccess(res, {
            message: 'OTP sent successfully.'
        })
    } catch(e) {
        return responseHandler.internalServerError(e)
    }
}

exports.login = async (req, res) => {
    const {email, password} = req.body
    const query = { email: email }
    const user = await User.findOne(query).lean().exec()
    if (user) {
        const isPassword = bcrypt.compareSync(password, user.password)
        if (isPassword) {
            if (user.account_verified !== true) {
                return responseHandler.sendError(res, {
                    message: 'Email address not verified.',
                    status: 401
                })
            }
            if(user.status != 'active') {
                return responseHandler.sendError(res, {
                    message: 'Account Not Active. Contact Support',
                    status: 401
                })
            }
            const token = await User.generateToken({id: user._id})
            return responseHandler.sendSuccess(res, {
                message: 'Login Successfully.',
                data: {
                    user,
                    access_token: token,
                    refresh_token: token
                }
            })
        }
    }
    return responseHandler.sendError(res, {
        message: 'email/password not correct.',
        status: 401
    })
}