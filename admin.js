var createError = require('http-errors')
var express = require('express')
var cors = require('cors')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
require('dotenv').config()

var user = require('./routes/user')
var home = require('./routes/home')

var app = express()
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(logger('dev'))
app.use(express.json({ limit: '1000mb' }))
app.use(express.urlencoded({ limit: '1000mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'admin_public')))
app.use(express.static(__dirname + '/public/uploads'))
// app.use(fileUpload())

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,X-Token',
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

app.use('/app/user', user)
app.use('/app/home', home)

app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
