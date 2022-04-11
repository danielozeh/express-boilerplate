const express = require('express')

const router = express.Router()
const api_version = '/v.1'

const authRoutes = require('./api/auth')

router.get('/', (req, res) => {
    return res.send('API is Running...')
})
router.use(api_version + '/auth', authRoutes)

module.exports = router
