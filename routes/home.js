const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const utility = require('../utils')
const auth = require('../middleware/auth')
const md5 = require('md5')
var moment = require('moment')
const transport = require('../lib/sendEmail')

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
    "user_del=": 0,
    "user_role=": 0,
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
  const paymentList = await globalModel.GetByQuery( query )
  
  return paymentList
    ? res.status(200).send({
        result: paymentList
      })
    : res.status(500).send({
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
//     user_email: user_email,
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
