const mail = require('nodemailer')
function sendMail(user, to, subject, content) {
  let transporter = mail.createTransport({
    host: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: 'emma202828@gmail.com',
      pass: 'prjkqrtobfebpfit',
    },
  })
  let mailOptions = {
    from: user,
    to: to,
    subject: subject,
    html: content,
  }
  return transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err)
      return false
    }
    return true
  })
}
module.exports = sendMail
