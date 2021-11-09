const express = require('express')
const router = express.Router()
const globalModel = require('../model/global')
const auth = require('../middleware/auth')
const { UpdateOne } = require('../model/global')

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
  const { isLogin, isRegister, isUpgrade, specifiedUser, smtpUser, smtpPass, adminEmail, userId } = req.body;
  console.log(  isLogin, isRegister, isUpgrade, specifiedUser, smtpUser, smtpPass, adminEmail, userId  )
  const user = await globalModel.GetOne('tb_user', { 'user_id=': userId })
  if (user.user_role === 3 ) {
    await globalModel.UpdateOne('tb_setting', { set_item_value: specifiedUser }, {'set_item_name=': 'set_specified_user'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: isRegister }, {'set_item_name=': 'set_allow_register'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: adminEmail }, {'set_item_name=': 'set_admin_email'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: isLogin }, {'set_item_name=': 'set_allow_login'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: smtpUser }, {'set_item_name=': 'set_smtp_user'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: smtpPass }, {'set_item_name=': 'set_smtp_pass'})
    await globalModel.UpdateOne('tb_setting', { set_item_value: isUpgrade }, {'set_item_name=': 'set_allow_upgrade'})
    res.status(200).send({
      result: true,
      msg: "Setting is saved sucessflly!"
    })
  } else{
    res.status(409).send({
      result: false,
      msg: "Your access is not defined!"
    })
  }
})
router.post('/update-amount', auth, async function (req, res) {
  const { user_id, level_id, level_amount } = req.body
  const user = await globalModel.GetOne('tb_user', {
    'user_id=': user_id,
  })
  console.log(  req.body );
  if (user.user_role === 3 ) {
    const level = await UpdateOne( "tb_level", { level_amount: level_amount }, { "level_id=": level_id} )
    res.status(200).send({
      result: true,
      msg: "Level amount is saved sucessflly!"
    })
  } else{
    res.status(409).send({
      result: false,
      msg: "Your access is not defined!"
    })
  }
})
module.exports = router
