const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'im202020558@gmail.com',
    pass: 'btihmyautdpqpkmc',
  },
})

module.exports = transport
