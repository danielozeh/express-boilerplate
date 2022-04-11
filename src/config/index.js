require('dotenv').config()

module.exports = {
    appName: process.env.APP_NAME || 'Express-Boiler-Plate',
    env: process.env.NODE_ENV,
    secret: process.env.APP_SECRET,
    port: process.env.PORT,
    mongoURL: process.env.MONGO_URL,
    amqp: {},
    redis: {},
    imagePath: {},
}
