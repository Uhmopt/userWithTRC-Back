const mail = require('nodemailer')
function sendMail(user, to, subject, content, smtpUser, smtpPass) {
  console.log( user, to, subject, content, smtpUser, smtpPass, 'Email send Data' )
  let transporter = mail.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
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
