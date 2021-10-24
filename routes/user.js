const express = require('express')
const router = express.Router()
const userModel = require('../model/user')
const globalModel = require('../model/global')
const emailLibrary = require('../eamil')
const utility = require('../utils')
const auth = require('../middleware/auth')
const md5 = require('md5')
const transport = require('../lib/sendEmail')

router.post('/register', async function (req, res) {
  const { user_email, user_password, user_wallet_address } = req.body
  console.log(user_email, user_password, user_wallet_address)
  if (!user_email || !user_password) {
    return res.status(400).send({
      msg: 'User password and email required!',
      result: false,
    })
  }
  const isExist = await globalModel.GetOne('tb_user', {
    user_email: user_email,
  })
  if (isExist) {
    return res.status(409).send({
      msg: 'The user Already Exist. Please Login!',
      result: false,
    })
  }

  const resRegister = await globalModel.InsertOne('tb_user', {
    user_email: user_email,
    user_password: md5(user_password),
    user_wallet_address: user_wallet_address ? user_wallet_address : '',
  })

  if (resRegister) {
    const token = utility.createToken(resRegister.insertId, user_email)
    const updateUser = globalModel.UpdateOne('tb_user', { user_token: token })
    return updateUser
      ? res.status(200).send({
          msg: 'The user has been registerd with us!',
          result: true,
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
  console.log(user_email, user_password, isRemember)
  if (!user_email && user_password) {
    return res.status(400).send({
      msg: 'User password and email required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    user_email: user_email,
    user_password: md5(user_password),
  })
  if (user) {
    console.log(user)
    // Create token
    const token = utility.createToken(user.user_id, user.user_email, isRemember)
    const updateUser = globalModel.UpdateOne('tb_user', { user_token: token })
    return updateUser
      ? res.status(200).send({
          msg: 'Logged in!',
          result: {
            email: user.user_email,
            token: token,
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
    user_email: user_email,
  })
  if (!user) {
    return res.status(409).send({
      msg: 'Email is not existed!',
      result: false,
    })
  }
  const verify = utility.verifyCode(100000, 999900)
  const updateUser = globalModel.UpdateOne('tb_user', {
    user_verify_code: verify,
  })
  if (updateUser) {
    emailLibrary.email_forgot_email(user_email, verify)
  }
  return res.status(200).send({
    msg: 'Email is sent',
    result: true,
  })
})

router.post('/verify-email', async function (req, res) {
  const { user_email, user_verify_code } = req.body
  if (!user_verify_code) {
    return res.status(400).send({
      msg: 'Email is required!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    user_verify_code: user_verify_code,
    user_email: user_email,
  })

  if (user) {
    if (user.user_expires_time > moment().unix()) {
      const updateUser = globalModel.UpdateOne(
        'tb_user',
        {
          user_verify_code: user_verify_code,
          user_is_verified: 1,
        },
        { user_email: user_email },
      )
    }
    return updateUser
      ? res.status(200).send({
          isVerified: true,
        })
      : res.status(200).send({
          isVerified: false,
        })
  }
  return res.status(409).send({
    isVerified: false,
  })
})

router.post('/reset-password', async function (req, res) {
  const { user_email, user_password } = req.body
  if (!user_password) {
    return res.status(400).send({
      msg: 'Password is required!',
      result: false,
    })
  }
  const user = globalModel.GetOne('tb_user', {
    user_email: user_email,
    user_is_verified: 1,
  })
  if (user) {
    if (user.user_expires_time > moment().unix()) {
      const resetPassword = globalModel.UpdateOne(
        'tb_user',
        { user_password: md5(user_password), user_is_verified: 0 },
        { user_email: user_email },
      )
      res.status(200).send({
        result: true,
      })
    }
    res.status(500).send({
      result: false,
    })
  }
  return res.status(500).send({
    result: false,
  })
})

router.post('/update', auth, async function (req, res) {
  const { user_email, user_password, user_wallet_address } = req.body
  if (!user_email || !user_wallet_address) {
    return res.status(400).send({
      result: false,
    })
  }
  const updateData = user_password
    ? {
        user_email: user_email,
        user_password: user_password,
        user_wallet_address: user_wallet_address,
      }
    : {
        user_email: user_email,
        user_wallet_address: user_wallet_address,
      }
  const updateUser = globalModel.UpdateOne('tb_user', updateData, {
    user_email: user_email,
  })
  return updateUser
    ? res.status(200).send({
        result: true,
      })
    : res.status(500).send({
        result: false,
      })
})

module.exports = router
