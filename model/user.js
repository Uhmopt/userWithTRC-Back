var db = require('../utils/database')
var jwt = require('jsonwebtoken')
var md5 = require('md5')
var moment = require('moment')

var register = async function (params) {
  var insert_fields = ['user_email', 'user_password', 'user_register_date']
  var data = {
    state: '',
    user: false,
  }
  if (!(params?.user_email && params?.user_password)) {
    data.state = 400
    return data
  }
  for (var i = 0; i < insert_fields.length; i++) {
    insert_fields[i] = '`' + insert_fields[i] + '`'
  }
  console.log(moment(new Date()).format('YYYY-MM-DD'))
  var insert_vals = [
    "'" + params['user_email'] + "'",
    "'" + md5(params['user_password']) + "'",
    "'" + moment(new Date()).format('YYYY-MM-DD') + "'",
  ]
  return db
    .list(
      "SELECT * FROM tb_user where user_email = '" + params['user_email'] + "'",
    )
    .then((r) => {
      if (r.length > 0) {
        data.state = 409
        return data
      }
      return db
        .list(
          db.statement(
            'insert into',
            'tb_user',
            '(' + insert_fields.join(',') + ')',
            '',
            'VALUES (' + insert_vals.join(',') + ')',
          ),
        )
        .then((row) => {
          // Create token
          const token = jwt.sign(
            { user_id: row.insertId, user_email: params['user_email'] },
            'ehDZcFPV5ZOBGPoVAOAWWAeSmYSCG3nSJkiSJGIfuVBNWpEEAXpaYg8LKapBdisgFTyWkW00cN11rpDr',
            {
              expiresIn: '2h',
            },
          )
          db.list(
            'UPDATE tb_user SET user_token = "' +
              token +
              '" WHERE user_email = ' +
              params['user_email'],
          )
          const user = {
            user_email: params['user_email'],
            user_token: token,
          }
          data.state = 200
          data.user = user
          return data
        })
    })
}
var login = function (params) {
  var data = {
    state: '',
    user: false,
  }
  if (!(params?.user_email && params?.user_password)) {
    data.state = 400
    return data
  }
  return db
    .list(
      "SELECT * FROM tb_user where user_email = '" +
        params['user_email'] +
        "' and user_password = '" +
        md5(params['user_password']) +
        "'",
    )
    .then((r) => {
      if (r.length > 0) {
        // Create token
        const token = jwt.sign(
          { user_id: r[0].user_id, user_email: params['user_email'] },
          'ehDZcFPV5ZOBGPoVAOAWWAeSmYSCG3nSJkiSJGIfuVBNWpEEAXpaYg8LKapBdisgFTyWkW00cN11rpDr',
          {
            expiresIn: '2h',
          },
        )
		console.log( 'UPDATE tb_user SET user_token = "' +
		token +
		'" WHERE user_email = "' +
		params['user_email'] + '"' );

        db.list(
          'UPDATE tb_user SET user_token = "' +
            token +
            '" WHERE user_email = "' +
            params['user_email'] + '"',
        )
        const user = {
          user_email: params['user_email'],
          user_token: token,
        }
        data.state = 200
        data.user = user
        return data
      } else {
        data.state = 401
        return data
      }
    })
}

var model = {
  register: register,
  login: login,
  //   get_user: get_user,
}

module.exports = model
