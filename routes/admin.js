const express = require('express')
const moment = require('moment')
const router = express.Router()
const globalModel = require('../model/global')
const auth = require('../middleware/auth')
const { UpdateOne } = require('../model/global')
const md5 = require('md5')

router.post('/get-setting', auth, async function (req, res) {
  const setting = await globalModel.Getlist('tb_setting')
  return setting
    ? res.status(200).send({
        result: setting,
      })
    : res.status(500).send({
        result: false,
      })
})
router.post('/update-setting', auth, async function (req, res) {
  const {
    isLogin,
    isRegister,
    isUpgrade,
    specifiedUser,
    smtpUser,
    smtpPass,
    adminEmail,
    userId,
  } = req.body
  console.log(
    isLogin,
    isRegister,
    isUpgrade,
    specifiedUser,
    smtpUser,
    smtpPass,
    adminEmail,
    userId,
  )
  const user = await globalModel.GetOne('tb_user', { 'user_id=': userId })
  if (user.user_role === 3) {
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: specifiedUser },
      { 'set_item_name=': 'set_specified_user' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: isRegister },
      { 'set_item_name=': 'set_allow_register' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: adminEmail },
      { 'set_item_name=': 'set_admin_email' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: isLogin },
      { 'set_item_name=': 'set_allow_login' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: smtpUser },
      { 'set_item_name=': 'set_smtp_user' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: smtpPass },
      { 'set_item_name=': 'set_smtp_pass' },
    )
    await globalModel.UpdateOne(
      'tb_setting',
      { set_item_value: isUpgrade },
      { 'set_item_name=': 'set_allow_upgrade' },
    )
    await globalModel.UpdateOne('tb_user', {user_superior_id: 0}, { 'user_id=': specifiedUser } );
    return res.status(200).send({
      result: true,
      msg: 'Setting is saved sucessflly!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not defined!',
    })
  }
})
router.post('/update-amount', auth, async function (req, res) {
  const { user_id, level_id, level_amount } = req.body
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  console.log(req.body)
  if (user.user_role === 3) {
    const level = await UpdateOne(
      'tb_level',
      { level_amount: level_amount },
      { 'level_id=': level_id },
    )
    return res.status(200).send({
      result: true,
      msg: 'Level amount is saved sucessflly!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not defined!',
    })
  }
})
router.post('/is-login-upgrade', auth, async function (req, res) {
  const { user_id, update, update_user_id } = req.body
  console.log(user_id, update)
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  if (user.user_role === 3) {
    const level = await UpdateOne('tb_user', update, {
      'user_id=': update_user_id,
    })
    return res.status(200).send({
      result: true,
      msg: 'Saved sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/update-user', auth, async function (req, res) {
  const {
    admin_id,
    user_id,
    user_email,
    user_level,
    user_rid,
    user_wallet_address,
  } = req.body
  if (
    !Boolean(
      user_id && user_email && user_level && user_rid && user_wallet_address,
    )
  ) {
    return res.status(400).send({
      msg: 'Please enter the information correctly!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': admin_id,
  })
  const update = {
    user_email: user_email,
    user_level: user_level,
    user_rid: user_rid,
    user_wallet_address: user_wallet_address,
  }
  console.log(update)
  if (user.user_role === 3) {
    const isWalletExist = await globalModel.GetOne('tb_user', {
      'user_wallet_address=': user_wallet_address,
      'user_id<>': user_id,
    })
    if (isWalletExist) {
      return res.status(409).send({
        msg:
          'The user wallet address already exist. Please use your own wallet',
        result: false,
      })
    }
    const isEmailExist = await globalModel.GetOne('tb_user', {
      'user_email=': user_email,
      'user_id<>': user_id,
    })
    if (isEmailExist) {
      return res.status(409).send({
        msg: 'The user Email already exist. Please try again',
        result: false,
      })
    }
    const level = await UpdateOne('tb_user', update, { 'user_id=': user_id })
    res.status(200).send({
      result: true,
      msg: 'Saved sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/update-admin', auth, async function (req, res) {
  const {
    admin_id,
    user_id,
    user_email,
    user_password,
  } = req.body
  if (
    !Boolean(
      admin_id && user_id && user_email && user_password,
    )
  ) {
    return res.status(400).send({
      msg: 'Please enter the information correctly!',
      result: false,
    })
  }
  const admin = await globalModel.GetOne('tb_user', {
    'user_id=': admin_id,
  })
  const update = {
    user_email: user_email,
    user_password: md5(user_password),
  }
  if (admin.user_role === 3) {
    const isEmailExist = await globalModel.GetOne('tb_user', {
      'user_email=': user_email,
      'user_id<>': user_id,
    })
    if (isEmailExist) {
      return res.status(409).send({
        msg: 'The user Email already exist. Please try again',
        result: false,
      })
    }
    const admin = await UpdateOne('tb_user', update, { 'user_id=': user_id })
    res.status(200).send({
      result: true,
      msg: 'Saved sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/insert-user', auth, async function (req, res) {
  const {
    user_id,
    user_email,
    user_password,
    user_invited_from,
    user_role,
    user_wallet_address,
  } = req.body
  if (
    !Boolean(
      user_id &&
        user_email &&
        user_password &&
        user_invited_from &&
        user_wallet_address,
    )
  ) {
    return res.status(400).send({
      msg: 'Please enter the information correctly!',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  if (user.user_role === 3) {
    const isExist = await globalModel.GetOne('tb_user', {
      'user_email=': user_email,
    })
    const isWalletExist = await globalModel.GetOne('tb_user', {
      'user_wallet_address=': user_wallet_address,
      'user_role=': '0',
    })
    const inviteUser = await globalModel.GetOne('tb_user', {
      'user_email=': user_invited_from,
    })
    const setting = await globalModel.GetOne('tb_setting', {
      'set_item_name=': 'set_specified_user',
    })
    if (isExist) {
      return res.status(409).send({
        msg: 'The email already exist. Please try again!',
        result: false,
      })
    }
    if (isWalletExist) {
      return res.status(409).send({
        msg:
          'The user wallet address already exist. Please use your own wallet',
        result: false,
      })
    }
    const insert = {
      user_email: user_email,
      user_role: user_role ? 3 : 0,
      user_wallet_address: user_wallet_address,
      user_password: user_password,
      user_invited_from: inviteUser
        ? inviteUser.user_id
        : setting.set_item_value,
      user_superior_id: inviteUser
        ? inviteUser.user_id
        : setting.set_item_value,
      user_is_verified: 1,
    }
    const user = await globalModel.InsertOne('tb_user', insert)
    return res.status(200).send({
      result: true,
      msg: 'Saved sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/get-user', auth, async function (req, res) {
  const { user_id } = req.body
  if (!Boolean(user_id)) {
    return res.status(400).send({
      msg: '',
      result: false,
    })
  }
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  return user
    ? res.status(200).send({
        result: user,
      })
    : res.status(409).send({
        result: false,
        msg: 'Your access is not allowed!',
      })
})
router.post('/get-admins', auth, async function (req, res) {
  const { admin_id } = req.body
  if (!Boolean(admin_id)) {
    return res.status(400).send({
      msg: '',
      result: false,
    })
  }
  const users = await globalModel.Getlist('tb_user', {
    'user_role=': 3
  })
  return users
    ? res.status(200).send({
        result: users,
      })
    : res.status(409).send({
        result: false,
        msg: 'Your access is not allowed!',
      })
})
router.post('/delete-user', auth, async function (req, res) {
  const { user_id, admin_id } = req.body
  if (!Boolean(user_id && admin_id)) {
    return res.status(400).send({
      msg: 'Please select user correctly!',
      result: false,
    })
  }
  const admin = await globalModel.GetOne('tb_user', {
    'user_id=': admin_id,
  })
  if (admin.user_role === 3) {
    const user = await globalModel.DeleteOne(
      'tb_user',
      {
        'user_id=': user_id,
      },
    )
    return res.status(200).send({
      result: true,
      msg: 'Deleted sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/user-payments', auth, async function (req, res) {
  const { user_id } = req.body
  if (!Boolean(user_id)) {
    return res.status(400).send({
      msg: 'Please select user correctly!',
      result: false,
    })
  }

  const paymentList = await globalModel.GetByQuery(
    `select * FROM tb_payment LEFT JOIN tb_user on pay_to = user_id WHERE pay_to = ${user_id} AND pay_confirmed = '1'`,
  )

  console.log(paymentList, 'HERE')

  return res.status(200).send({
    result: paymentList || [],
    msg: 'Get data sucessfully!',
  })
})
router.post('/get-payment-history', auth, async function (req, res) {

  const paymentList = await globalModel.GetByQuery(
    `select AA.*, BB.user_rid as upper_id, CC.user_level, BB.user_wallet_address, CC.user_rid, BB.user_level from tb_payment as AA LEFT JOIN tb_user AS BB ON AA.pay_to = BB.user_id LEFT JOIN tb_user as CC ON AA.pay_from = CC.user_id ORDER BY AA.pay_time`,
  )

  return res.status(200).send({
    result: paymentList || [],
    msg: 'Get data sucessfully!',
  })
})
router.post('/delete-payment', auth, async function (req, res) {
  const { pay_id, admin_id } = req.body
  console.log( pay_id, admin_id )
  if (!Boolean(pay_id && admin_id)) {
    return res.status(400).send({
      msg: 'Please select payment correctly!',
      result: false,
    })
  }
  const admin = await globalModel.GetOne('tb_user', {
    'user_id=': admin_id,
  })
  if (admin.user_role === 3) {
    const payment = await globalModel.DeleteOne(
      'tb_payment',
      {
        'pay_id=': pay_id,
      },
    )
    return res.status(200).send({
      result: true,
      msg: 'Deleted sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
router.post('/approve-payment', auth, async function (req, res) {
  const { pay_id, admin_id } = req.body
  console.log( pay_id, admin_id )
  if (!Boolean(pay_id && admin_id)) {
    return res.status(400).send({
      msg: 'Please select payment correctly!',
      result: false,
    })
  }
  const admin = await globalModel.GetOne('tb_user', {
    'user_id=': admin_id,
  })
  if (admin.user_role === 3) {
    const update = await globalModel.UpdateOne(
      'tb_payment',
      {
        pay_upgrade_state: 1,
        pay_upgrade_time: moment().format()
      },
      {
        'pay_id=': pay_id,
      },
    )
    const payment = await globalModel.GetOne('tb_payment', { 'pay_id=': pay_id })
    const fromUser = await globalModel.GetOne('tb_user', { 'user_id=': payment.pay_from })
    const toUser = await globalModel.GetOne('tb_user', { 'user_id=': fromUser.user_superior_id })
    const updateData = {
      user_level: Number(fromUser.user_level) + 1,
      user_superior_id: toUser ? toUser.user_invited_from : 0,
    }
    const updateUser = await globalModel.UpdateOne('tb_user', updateData, {
      'user_id=': fromUser.user_id,
    })
    return res.status(200).send({
      result: true,
      msg: 'Approved sucessfully!',
    })
  } else {
    return res.status(409).send({
      result: false,
      msg: 'Your access is not allowed!',
    })
  }
})
module.exports = router
