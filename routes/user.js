const express = require('express')
const router = express.Router()
const userModel = require('../model/user')
const globalModel = require('../model/global')
const utility = require('../utils')
const auth = require('../middleware/auth')
const md5 = require('md5')
var moment = require('moment')
const transport = require('../lib/sendEmail')

const unitId = 2000
const expireTime = 2592000

router.post('/register', async function (req, res) {
  const { user_email, user_password, user_wallet_address } = req.body
  if (!user_email || !user_password) {
    return res.status(400).send({
      msg: 'User password and email required!',
      result: false,
    })
  }
  const isExist = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
  })
  if (isExist) {
    return res.status(409).send({
      msg: 'The user Already Exist. Please Login!',
      result: false,
    })
  }
  const verifyCode = utility.verifyCode()
  const resRegister = await globalModel.InsertOne('tb_user', {
    user_email: user_email,
    user_password: md5(user_password),
    user_wallet_address: user_wallet_address ? user_wallet_address : '',
    user_verify_code: verifyCode,
    user_expires: moment().unix() + expireTime,
  })
  // Email sent part
  if (Boolean(resRegister)) {
    const token = utility.createToken(resRegister.insertId, user_email)
    const updateUser = globalModel.UpdateOne(
      'tb_user',
      { user_token: token, user_rid: resRegister.insertId + unitId },
      { 'user_email=': user_email },
    )
    return updateUser
      ? res.status(200).send({
          msg: 'The user has been registerd with us!',
          result: {
            user_email: user_email,
            user_password: md5(user_password),
            user_wallet_address: user_wallet_address ? user_wallet_address : '',
            user_verify_code: verifyCode,
            user_expires: moment().unix() + expireTime,
            user_token: token,
            user_rid: resRegister.insertId + unitId,
          },
        })
      : res.status(500).send({
          msg: 'The user register failed!',
          result: false,
        })
  }
  return res.status(500).send({
    msg: 'The user register failed!',
    result: false,
  })
})

router.post('/login', async function (req, res) {
  // await transport.sendEmail({
  //   from: 'from_address@example.com',
  //   to: 'talentlucky0816@gmail.com',
  //   subject: 'Test Email Subject',
  //   html: '<h1>Example HTML Message Body</h1>',
  // })
  const { user_email, user_password, isRemember } = req.body
  if (!user_email || !user_password) {
    return res.status(400).send({
      msg: 'User password and email required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
    'user_password=': md5(user_password),
  })
  if (user) {
    if (user.user_is_verified === 0) {
      return res.status(201).send({
        msg: 'Please verify your email first.',
        isVerifyRequired: true,
        result: {
          user_email: user.user_email,
        },
      })
    }
    // Create token
    const token = utility.createToken(user.user_id, user.user_email, isRemember)
    const updateUser = globalModel.UpdateOne(
      'tb_user',
      { user_token: token, user_rid: user.user_id + unitId },
      { 'user_email=': user_email },
    )
    return updateUser
      ? res.status(200).send({
          msg: 'Logged in!',
          result: {
            ...user,
            user_token: token,
            user_rid: user.user_id + unitId,
          },
        })
      : res.status(409).send({
          msg: 'Username or password is incorrect!',
          result: false,
        })
  }
  return res.status(409).send({
    msg: 'Username or password is incorrect!',
    result: false,
  })
})

router.post('/forgot-password', async function (req, res) {
  const { user_email } = req.body
  if (!user_email) {
    return res.status(400).send({
      msg: 'Email is required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
  })
  if (!user) {
    return res.status(409).send({
      msg: 'Email is not existed!',
      result: false,
    })
  }
  const verify = utility.verifyCode()
  const updateUser = globalModel.UpdateOne(
    'tb_user',
    { user_verify_code: verify, user_expires: moment().unix() + 600 },
    { 'user_email=': user_email },
  )
  // Email Sent
  return updateUser
    ? res.status(200).send({
        msg: 'Email is sent',
        result: { user_email: user_email },
      })
    : res.status(500).send({
        msg: 'Something went wrong!',
        result: false,
      })
})

router.post('/verification', async function (req, res) {
  const { user_verify_code, user_email } = req.body
  if (!user_verify_code) {
    return res.status(400).send({
      msg: 'Verification code is required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_verify_code=': user_verify_code,
    'user_email=': user_email,
  })
  if (user.user_expires < moment().unix()) {
    return res.status(500).send({
      msg: 'Expire time is over. Please try again!',
      result: false,
    })
  }
  if (Boolean(user)) {
    const token = utility.createToken(user.user_id, user.user_email)
    const updateUser = globalModel.UpdateOne(
      'tb_user',
      {
        user_token: token,
        user_is_verified: 1,
      },
      {
        'user_id=': user.user_id,
      },
    )
    return updateUser
      ? res.status(200).send({
          msg: 'Your email verified successfully',
          result: {
            user_verify_code: user_verify_code,
            user_email: user_email,
          },
        })
      : res.status(409).send({
          msg: 'Something went wrong!',
          result: false,
        })
  }
  res.status(409).send({
    msg: 'The verification code is not matched!',
    result: false,
  })
})

router.post('/reset-password', async function (req, res) {
  const { user_email, user_password, user_verify_code } = req.body
  if (!user_password) {
    return res.status(400).send({
      msg: 'Password is required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
    'user_verify_code=': user_verify_code,
  })
  if (user) {
    const token = utility.createToken(user.user_id, user_email)
    const resetPassword = globalModel.UpdateOne(
      'tb_user',
      { user_password: md5(user_password), user_token: token },
      { 'user_email=': user_email },
    )
    return resetPassword
      ? res.status(200).send({
          msg: 'Password is reseted!',
          result: {
            ...user,
            user_token: token,
          },
        })
      : res.status(409).send({
          msg: 'Something went wrong!',
          result: false,
        })
  }
  res.status(409).send({
    msg: 'Please verify email first!',
    result: false,
  })
})

// router.post('/update', auth, async function (req, res) {
//   const { user_email, user_password, user_wallet_address } = req.body
//   if (!user_email || !user_wallet_address) {
//     return res.status(400).send({
//       result: false,
//     })
//   }
//   const updateData = user_password
//     ? {
//         user_email: user_email,
//         user_password: user_password,
//         user_wallet_address: user_wallet_address,
//       }
//     : {
//         user_email: user_email,
//         user_wallet_address: user_wallet_address,
//       }
//   const updateUser = globalModel.UpdateOne('tb_user', updateData, {
//     "user_email=": user_email,
//   })
//   return updateUser
//     ? res.status(200).send({
//         result: true,
//       })
//     : res.status(500).send({
//         result: false,
//       })
// })

module.exports = router
