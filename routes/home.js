const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const utility = require('../utils')
const auth = require('../middleware/auth')
const md5 = require('md5')
var moment = require('moment')
const transport = require('../lib/sendEmail')

const expireTime = 259200
const unitId = 2000

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
  const query = `SELECT * FROM tb_payment WHERE pay_from = ${user_id} OR pay_to = ${user_id} ORDER BY pay_date`
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
  console.log(contactData)

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
    // Email Sent Part///////////////////////////
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

module.exports = router
