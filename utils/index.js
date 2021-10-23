const jwt = require('jsonwebtoken')

var createUniqueString = function () {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

var urlify = function (text) {
  var urlRegex = /(https?:\/\/[^\s】]+)/g
  if (text) {
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '">' + url + '</a>'
    })
  } else {
    return null
  }
}

var currentTime = function () {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

var verifyCode = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

var createToken = function (user_id, user_email, isRemember) {
  // Create token
  const token = jwt.sign(
    { user_id: user_id, user_email: user_email },
    process.env.TOKEN_KEY,
    {
      expiresIn: isRemember?'0.2h':'0.1h',
    },
  )
  return token
}

var exports = {
  createUniqueString: createUniqueString,
  urlify: urlify,
  currentTime: currentTime,
  verifyCode: verifyCode,
  createToken: createToken
}

module.exports = exports
