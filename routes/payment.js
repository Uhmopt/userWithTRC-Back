const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const auth = require('../middleware/auth')

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
    pay_time: timestamp,
  })
  if (
    insertPayment &&
    confirmed &&
    result === 'SUCCESS' &&
    symbol === 'USDT' &&
    amount > level.level_amount + fromUser.user_rid
  ) {
    const updateData = {
      user_level: Number(fromUser.user_level) + 1,
      user_superior_id: toUser.user_superior_id,
    }
    const unpdateUser = await globalModel.UpdateOne('tb_user', updateData, {
      'user_id=': fromUser.user_id,
    })
    return unpdateUser
      ? res.status(200).send({
          msg: 'User upgraded successfully!',
          result: {
            ...fromUser,
            ...updateData,
          },
        })
      : res.status(409).send({
          msg: 'User upgraded failed!',
          result: false,
        })
  }
  return res.status(409).send({
    msg:
      'User-level upgrade failed. Please confirm your USDT transfer is over neccesary amount and a success.',
    result: false,
  })
})

router.post('/get-amount-address', auth, async function (req, res) {
  const { user_id } = req.body
  if (!user_id) {
    return res.status(400).send({
      result: false,
    })
  }

  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  const levelByDegree = await globalModel.GetOne('tb_level', {
    'level_degree=': user.user_level,
  })

  let superior = await globalModel.GetOne('tb_user', {
    'user_id=': user.user_superior_id,
  })

  if (user.user_superior_id === 0 || user.user_level >= superior.user_level) {
    superior = await globalModel.GetOne('tb_user', {
      'user_id=': levelByDegree.level_user,
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
