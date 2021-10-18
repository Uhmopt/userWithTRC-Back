var express = require('express')
var router = express.Router()
var model = require('../model/user')

router.post('/register', async function (req, res) {
  var data = await model.register(req.body)
  var msg = '';
  var resData = false;
  switch (data.state) {
    case 400:
      msg = 'All input is required';
      resData = false;
      break
    case 409:
      msg = 'User Already Exist. Please Login';
      resData = false;
      break
    case 200:
      msg = 'The user has been registerd with us!';
      resData = data.user;
      break
    default:
      msg = 'We can access in database!';
      break
  }
  return res.status(data.state).send({
    msg: msg,
    user: resData
  })
})

router.post('/login', async function (req, res) {
  var data = await model.login(req.body);
  switch (data.state) {
    case 400:
      msg = 'All input is required';
      resData = false;
      break
    case 409:
      msg = 'Username or password is incorrect!';
      resData = false;
      break
    case 200:
      msg = 'Logged in!';
      resData = data.user;
      break
    default:
      msg = 'We can access in database!';
      break
  }
  return res.status(data.state).send({
    msg: msg,
    user: resData
  })
})

router.post('/forgetpassword', async function (req, res) {
  var data = await model.login(req.body)
  if (data === '200') {
    return res.status(201).send({
      msg: 'Logged in!',
    })
  } else if (data === '409') {
    return res.status(409).send({
      msg: 'Username or password is incorrect!',
    })
  } else {
    return res.status(500).send({
      msg: 'Sorry, We can access in database!',
    })
  }
})
module.exports = router
