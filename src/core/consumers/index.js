const boilerPlateEvent = require('./events')

boilerPlateEvent.on('email.notification', (sub, msg) => {
    const { event, action, data } = boilerPlateEvent.messageContent(msg)
    console.log('Sending Email to User Begins Here')
    sub.ack(msg)
    //console.log('')
})

module.exports = boilerPlateEvent
