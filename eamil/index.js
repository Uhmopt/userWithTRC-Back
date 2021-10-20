

var axios = require('axios')
const email_forgot_email = (email, verifyCode) => {
  let msgText = ''

  msgText =
    "<p style='font-size: 14px;'>You can use this verification code to reset you password.</p>"
  msgText = `<p style='font-size: 18px;'>${verifyCode}</p>`

  const response = axios.post(
    'https://api.sendinblue.com/v3/smtp/email',
    {
      sender: {
        name: 'Xian',
        email: 'test@test.com',
      },
      to: [
        {
          // email: email,
          email: "talentlucky0816@gmail.com",
          // name: sendData.name,
        },
      ],
      replyTo: { email: 'test@test.com' },
      htmlContent: msgText,
      subject: 'Verify the code',

    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key':
        process.env.EMAIL_API_KEY,
      },
    }
  )
}

var exports = { email_forgot_email }

module.exports = exports;