const express = require('express')
const router = express.Router()
const userModel = require('../model/user')
const globalModel = require('../model/global')
const utility = require('../utils')
const auth = require('../middleware/auth')
const nodemailer = require('nodemailer')
const md5 = require('md5')
var moment = require('moment')
const sendMail = require('../lib/sendMail')

const unitId = 2000
const expireTime = 2592000

router.post('/register', async function (req, res) {
  const {
    user_email,
    user_password,
    user_wallet_address,
    user_invited_from,
  } = req.body
  if (!user_email || !user_password) {
    return res.status(400).send({
      msg: 'emailPassRequired',
      result: false,
    })
  }
  const isExist = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
  })
  const isWalletExist = await globalModel.GetOne('tb_user', {
    'user_wallet_address=': user_wallet_address,
  })

  const inviteUser = await globalModel.GetOne('tb_user', {
    'user_email=': user_invited_from,
  })

  const setting = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_specified_user',
  })

  const isRegisterAllowed = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_allow_register',
  })

  if(isRegisterAllowed.set_item_value !== '1') {
    return res.status(409).send({
      msg: 'registerNotAllowed',
      result: false,
    })
  }

  if (isExist) {
    return res.status(409).send({
      msg: 'userExist',
      result: false,
    })
  }

  if (isWalletExist) {
    return res.status(409).send({
      msg: 'walletExist',
      result: false,
    })
  }

  const verifyCode = utility.verifyCode()
  const resRegister = await globalModel.InsertOne('tb_user', {
    user_email: user_email,
    user_password: md5(user_password),
    user_wallet_address: user_wallet_address ? user_wallet_address : '',
    user_verify_code: verifyCode,
    user_invited_from: inviteUser ? inviteUser.user_id : setting.set_item_value,
    user_superior_id: inviteUser ? inviteUser.user_id : setting.set_item_value,
    user_expires: moment((moment().unix() + expireTime) * 1000).format(),
    user_is_verified: 1,
  })
  // Email sent part
  // const setting = await globalModel.GetOne('tb_setting', {
  //   'set_item_name=': 'set_admin_email',
  // })
  // // Email Sent
  // const isSent = await sendMail( setting.set_item_value, user_email, 'Please verify your email for Sign up', `<h4>${verifyCode}</h4>`)
  // console.log( isSent, 'Email Sent' )

  if (Boolean(resRegister)) {
    const token = utility.createToken(resRegister.insertId, user_email)
    const updateUser = globalModel.UpdateOne(
      'tb_user',
      { user_token: token, user_rid: resRegister.insertId + unitId },
      { 'user_email=': user_email },
    )
    return updateUser
      ? res.status(200).send({
          msg: 'successRegister',
          result: {
            user_email: user_email,
            user_wallet_address: user_wallet_address ? user_wallet_address : '',
            user_verify_code: verifyCode,
            user_expires: moment(
              (moment().unix() + expireTime) * 1000,
            ).format(),
            user_token: token,
            user_rid: resRegister.insertId + unitId,
            user_is_verified: 1,
            user_id: resRegister.insertId,
          },
        })
      : res.status(500).send({
          msg: 'failedRegister',
          result: false,
        })
  }
  return res.status(500).send({
    msg: 'failedRegister',
    result: false,
  })
})

router.post('/login', async function (req, res) {
  const { user_email, user_password, isRemember } = req.body
  if (!user_email || !user_password) {
    return res.status(400).send({
      msg: 'emailPassRequired',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
    'user_password=': md5(user_password),
  })
  const setting = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_allow_login',
  })

  if (user) {
    // Note Check the app login allowed
    if (Number(setting.set_item_value) === 0 && user.user_role === 0) {
      return res.status(409).send({
        msg: 'loginNotAllowed',
        result: false,
      })
    }
    // Note Check the user login allowed
    if (user.user_allow_login === 0) {
      return res.status(409).send({
        msg: 'loginNotAllowed',
        result: false,
      })
    }
    if (user.user_is_verified === 0) {
      return res.status(201).send({
        msg: 'verifyEmail',
        isVerifyRequired: true,
        result: {
          user_email: user.user_email,
        },
      })
    }
    // Create token
    const token = utility.createToken(user.user_id, user.user_email, isRemember)
    const updateUser = await globalModel.UpdateOne(
      'tb_user',
      { user_token: token, user_rid: user.user_id + unitId },
      { 'user_email=': user_email },
    )
    return updateUser
      ? res.status(200).send({
          msg: 'successLogin',
          result: {
            ...user,
            user_token: token,
            user_rid: user.user_id + unitId,
          },
        })
      : res.status(409).send({
          msg: 'emailPassNotCorrect',
          result: false,
        })
  }
  return res.status(409).send({
    msg: 'emailPassNotCorrect',
    result: false,
  })
})

router.post('/forgot-password', async function (req, res) {
  const { user_email } = req.body
  if (!user_email) {
    return res.status(400).send({
      msg: 'emailRequired',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
  })
  if (!user) {
    return res.status(409).send({
      msg: 'emailNotExist',
      result: false,
    })
  }
  const verify = utility.verifyCode()
  const updateUser = await globalModel.UpdateOne(
    'tb_user',
    {
      user_verify_code: verify,
      user_expires: moment((moment().unix() + 600) * 1000).format(),
    },
    { 'user_email=': user_email },
  )
  const setting = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_admin_email',
  })
  const smtpUser =  await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_smtp_user',
  })
  const smtpPass =  await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_smtp_pass',
  })
  // Email Sent
  const isSent = await sendMail(
    setting.set_item_value,
    user_email,
    'Please verify your email for reset password',
    `You are retrieving your password, the verification code is ${verify}`,
    smtpUser.set_item_value,
    smtpPass.set_item_value,
  )
  return updateUser
    ? res.status(200).send({
        msg: 'emailSent',
        result: { user_email: user_email },
      })
    : res.status(500).send({
        msg: 'wrong',
        result: false,
      })
})

router.post('/verification', async function (req, res) {
  const { user_verify_code, user_email } = req.body
  console.log(user_verify_code, user_email)
  if (!user_verify_code) {
    return res.status(400).send({
      msg: 'verifyCodeRequired',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_verify_code=': user_verify_code,
    'user_email=': user_email,
  })
  if (moment(user.user_expires).unix() < moment().unix()) {
    return res.status(500).send({
      msg: 'expireTimeOver',
      result: false,
    })
  }

  if (Boolean(user)) {
    const token = utility.createToken(user.user_id, user.user_email)
    const updateUser = await globalModel.UpdateOne(
      'tb_user',
      {
        user_token: token,
        user_is_verified: 1,
      },
      {
        'user_id=': user.user_id,
      },
    )
    console.log({
      ...user,
      user_verify_code: user_verify_code,
      user_is_verified: 1,
      user_email: user_email,
    })
    return updateUser
      ? res.status(200).send({
          msg: 'emailVerifySuccess',
          result: {
            ...user,
            user_verify_code: user_verify_code,
            user_is_verified: 1,
            user_email: user_email,
          },
        })
      : res.status(409).send({
          msg: 'wrong',
          result: false,
        })
  }
  res.status(409).send({
    msg: 'verifyCodeNotMatch',
    result: false,
  })
})

router.post('/reset-password', async function (req, res) {
  const { user_email, user_password, user_verify_code } = req.body
  if (!user_password) {
    return res.status(400).send({
      msg: 'passRequired',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_email=': user_email,
    'user_verify_code=': user_verify_code,
  })
  if (user) {
    const token = utility.createToken(user.user_id, user_email)
    const resetPassword = await globalModel.UpdateOne(
      'tb_user',
      { user_password: md5(user_password), user_token: token },
      { 'user_email=': user_email },
    )
    return resetPassword
      ? res.status(200).send({
          msg: 'passReseted',
          result: {
            ...user,
            user_token: token,
          },
        })
      : res.status(409).send({
          msg: 'wrong',
          result: false,
        })
  }
  res.status(409).send({
    msg: 'verifyEmail',
    result: false,
  })
})

module.exports = router
