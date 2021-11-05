const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const auth = require('../middleware/auth')
var moment = require('moment')

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
    from_user_id
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
    'user_id=': from_user_id,
  })

  const toUser = await globalModel.GetOne('tb_user', {
    'user_wallet_address=': to,
  })

  const level = await globalModel.GetOne('tb_level', {
    'level_degree=': fromUser.user_level,
  })
  const insertPayment = await globalModel.InsertOne('tb_payment', {
    pay_hash: hash,
    pay_from: fromUser.user_id,
    pay_to: toUser.user_id,
    pay_result: result,
    pay_confirmed: confirmed ? 1 : 0,
    pay_amount: amount,
    pay_time: moment().format(),
  })
  if (
    insertPayment &&
    confirmed &&
    result === 'SUCCESS' &&
    symbol === 'USDT' &&
    amount === Number(level.level_amount) + Number(fromUser.user_rid)
  ) {
    const updateData = {
      user_level: Number(fromUser.user_level) + 1,
      user_superior_id: toUser.user_superior_id,
    }
    const updateUser = await globalModel.UpdateOne('tb_user', updateData, {
      'user_id=': fromUser.user_id,
    })
    console.log('THIS IS THE PAYMENT')
    return res.status(200).send({
      msg: 'User is upgrade sucessfullly!',
      result: {
        ...fromUser,
        ...updateData,
      },
    })
  }
  return res.status(409).send({
    msg:
      'User-level upgrade failed. Please confirm your USDT transfer.',
    result: false,
  })
})

router.post('/get-amount-address', auth, async function (req, res) {
  const { user_level, user_superior_id } = req.body

  const setting = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'specified_user_id',
  })
  const levelByDegree = await globalModel.GetOne('tb_level', {
    'level_degree=': user_level,
  })

  let superior = await globalModel.GetOne('tb_user', {
    'user_id=': user_superior_id,
  })
  // Note: If there is no superior id
  // or user level is over the superior level
  // then set superior as specified user who admin setted
  if (user_superior_id === 0 || user_level >= superior.user_level) {
    superior = await globalModel.GetOne('tb_user', {
      'user_id=': setting.set_item_value,
    })
  }

  // if (user.user_superior_id === 0 || user.user_level >= superior.user_level) {
  //   superior = await globalModel.GetOne('tb_user', {
  //     'user_id=': levelByDegree.level_user,
  //   })
  // }
  const wallet_address = superior.user_wallet_address
  const amount = levelByDegree.level_amount

  return res.status(200).send({
    result: {
      superior_wallet_address: wallet_address,
      neccesary_amount: amount,
    },
  })
})

module.exports = router
