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
    from_user_id,
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
      msg: 'hashUsed',
      result: false,
    })
  }
  const fromUser = await globalModel.GetOne('tb_user', {
    'user_id=': from_user_id,
  })

  const isUpgrade = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_allow_upgrade',
  })
  if (isUpgrade.set_item_value !== '1' || fromUser.user_allow_upgrade !== 1 ) {
    return res.status(409).send({
      result: false,
      msg: 'upgradeNotAllowed'
    })
  }
  const toUser = await globalModel.GetOne('tb_user', {
    'user_id=': fromUser.user_superior_id,
  })

  const payUser = await globalModel.GetOne('tb_user', {
    'user_wallet_address=': to,
  })

  const level = await globalModel.GetOne('tb_level', {
    'level_degree=': fromUser.user_level + 1,
  })

  if (
    confirmed &&
    result === 'SUCCESS' &&
    symbol === 'USDT' &&
    amount === Number(level.level_amount) + Number(fromUser.user_rid)
  ) {
    const insertPayment = await globalModel.InsertOne('tb_payment', {
      pay_hash: hash,
      pay_from: fromUser.user_id,
      pay_to: payUser.user_id,
      pay_result: result,
      pay_confirmed: confirmed ? 1 : 0,
      pay_amount: amount,
      pay_time: moment().format(),
      pay_upgrade_time: moment().format(),
      pay_level: fromUser.user_level + 1,
      pay_upgrade_state: 1,
      pay_wallet_address: payUser.user_wallet_address
    })
    const updateData = {
      user_level: Number(fromUser.user_level) + 1,
      user_superior_id: toUser ? toUser.user_invited_from : 0,
    }
    const updateUser = await globalModel.UpdateOne('tb_user', updateData, {
      'user_id=': fromUser.user_id,
    })
    console.log('THIS IS THE PAYMENT')
    return res.status(200).send({
      msg: 'upgradeSuccess',
      result: {
        ...fromUser,
        ...updateData,
      },
    })
  } else {
    const insertPayment = await globalModel.InsertOne('tb_payment', {
      pay_hash: hash,
      pay_from: fromUser.user_id,
      pay_to: payUser.user_id,
      pay_result: result,
      pay_confirmed: confirmed ? 1 : 0,
      pay_amount: amount,
      pay_level: fromUser.user_level + 1,
      pay_wallet_address: payUser.user_wallet_address,
      pay_time: moment().format(),
    })
    return insertPayment? res.status(409).send({
      msg: 'waitUpgrade',
      result: true,
    }):res.status(409).send({
      msg: 'wrong',
      result: false,
    })
  }
})

router.post('/get-amount-address', auth, async function (req, res) {
  const { user_level, user_superior_id } = req.body
  const setting = await globalModel.GetOne('tb_setting', {
    'set_item_name=': 'set_specified_user',
  })
  const levelByDegree = await globalModel.GetOne('tb_level', {
    'level_degree=': user_level + 1,
  })
  console.log( levelByDegree, 'HER' )
  let superior = await globalModel.GetOne('tb_user', {
    'user_id=': user_superior_id,
  })
  // Note: If there is no superior id
  // or user level is over the superior level
  // then set superior as specified user who admin setted
  console.log( superior, 'Superior' )
  while (
    (!superior || user_level >= superior.user_level) &&
    Number(setting.set_item_value) !== Number(superior.user_id)
  ) {
    superior = await globalModel.GetOne('tb_user', {
      'user_id=': !superior
        ? setting.set_item_value
        : superior.user_invited_from,
    })
  }
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
