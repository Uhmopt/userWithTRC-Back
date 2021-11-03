const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const utility = require('../utils')
const auth = require('../middleware/auth')
const md5 = require('md5')
var moment = require('moment')

const expireTime = 259200

router.post('/get-user', auth, async function (req, res) {
  const { user_id } = req.body
  console.log(user_id)
  const user = await globalModel.GetOne('tb_user', { 'user_id=': user_id })
  return user
    ? res.status(200).send({
        result: user,
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/get-levels', auth, async function (req, res) {
  const userLevels = await globalModel.Getlist('tb_level')
  return userLevels
    ? res.status(200).send({
        result: userLevels,
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/get-users', auth, async function (req, res) {
  const userList = await globalModel.Getlist('tb_user', {
    'user_del=': 0,
    'user_role=': 0,
    'user_is_verified<>': 0,
  })
  return userList
    ? res.status(200).send({
        result: userList,
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/get-payments', auth, async function (req, res) {
  const { user_id } = req.body
  const query = `SELECT * FROM tb_payment WHERE pay_from = ${user_id} OR pay_to = ${user_id} ORDER BY pay_time`
  const paymentList = await globalModel.GetByQuery(query)

  return paymentList
    ? res.status(200).send({
        result: paymentList,
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/update', auth, async function (req, res) {
  const { user_id, user_email, user_password, user_wallet_address } = req.body
  if (!user_id || !user_email || !user_wallet_address) {
    return res.status(400).send({
      result: false,
    })
  }
  const verifyCode = utility.verifyCode()
  const updateData = user_password
    ? {
        user_email: user_email,
        user_password: md5(user_password),
        user_wallet_address: user_wallet_address,
        user_is_verified: 0,
        user_expires: moment().unix() + expireTime,
        user_verify_code: verifyCode,
      }
    : {
        user_email: user_email,
        user_wallet_address: user_wallet_address,
        user_is_verified: 0,
        user_expires: moment().unix() + expireTime,
        user_verify_code: verifyCode,
      }
  // Email sent part
  const updateUser = await globalModel.UpdateOne('tb_user', updateData, {
    'user_id=': user_id,
  })
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  return updateUser
    ? res.status(200).send({
        result: {
          ...user,
        },
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/contact', auth, async function (req, res) {
  const { user_id, email, rid, theme, contact } = req.body
  if (!user_id || !email || !rid || !theme || !contact) {
    return res.status(400).send({
      result: false,
    })
  }
  const verifyCode = utility.verifyCode()
  const contactData = {
    contact_user: user_id,
    contact_email: email,
    contact_theme: theme,
    contact_text: contact,
    contact_rid: rid,
    contact_verify_code: verifyCode,
    contact_is_verified: 0,
  }

  // Email Sent Part///////////////////////////
  const insertState = await globalModel.InsertOne('tb_contact', contactData)
  return Boolean(insertState)
    ? res.status(200).send({
        result: {
          contact_id: insertState.insertId,
        },
        msg: 'Please verify your email!',
      })
    : res.status(500).send({
        result: false,
      })
})

router.post('/contact-verification', auth, async function (req, res) {
  const { contact_id, contact_verify_code } = req.body
  if (!contact_verify_code) {
    return res.status(400).send({
      msg: 'Verification code is required!',
      result: false,
    })
  }
  const contact = await globalModel.GetOne('tb_contact', {
    'contact_verify_code=': contact_verify_code,
    'contact_id=': contact_id,
  })
  if (Boolean(contact)) {
    await globalModel.UpdateOne(
      'tb_contact',
      { contact_is_verified: 1 },
      {
        'contact_id=': contact_id,
      },
    )
    const setting = await globalModel.GetOne('tb_setting', {
      'set_item_name=': 'admin_email',
    })
    // Email Sent Part///////////////////////////
    const isSent = await sendMail(
      contact.contact_email,
      setting.set_item_value,
      contact.contact_theme,
      `<h4>ID:${contact.contact_rid}</h4><br /><h4>${contact.contact_text}</h4>`,
    )
    return contact
      ? res.status(200).send({
          msg: 'Your email sent successfully',
          result: true,
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

router.post('/submit-hash', auth, async function (req, res) {
  const {
    hash,
    confirmed,
    result,
    amount,
    from,
    to,
    symbol,
    timestamp,
  } = req.body
  if (!hash || !confirmed || !result || !amount || !from || !to) {
    return res.status(400).send({
      result: false,
    })
  }

  const isUsed = await globalModel.GetOne('tb_payment', {
    'pay_hash=': hash,
  })

  if (isUsed) {
    return res.status(409).send({
      msg: 'This hash is used already!',
      result: false,
    })
  }
  const fromUser = await globalModel.GetOne('tb_user', {
    'user_wallet_address=': from,
  })

  const toUser = await globalModel.GetOne('tb_user', {
    'user_wallet_address=': to,
  })
  const insertPayment = await globalModel.InsertOne('tb_payment', {
    pay_hash: hash,
    pay_from: fromUser.user_id,
    pay_to: toUser.user_id,
    pay_result: result,
    pay_confirmed: confirmed ? 1 : 0,
    pay_amount: amount,
    pay_time: timestamp,
  })
  if (
    insertPayment &&
    confirmed &&
    result === 'SUCCESS' &&
    symbol === 'USDT' &&
    amount > 0
  ) {
    const updateData = {
      user_level: Number(fromUser.user_level) + 1,
      user_superior_id: toUser.user_superior_id,
    }
    const unpdateUser = await globalModel.UpdateOne('tb_user', updateData, {
      'user_id=': fromUser.user_id,
    })
    return res.status(200).send({
      result: true,
    })
  }
  return res.status(409).send({
    result: false,
  })
})

module.exports = router
