var mysql = require('mysql')
var config = require('./../src/config')

//database handle
var con

function handleDisconnect() {
  con = mysql.createConnection(config.mysql)
  con.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err)
      setTimeout(handleDisconnect, 2000)
    }
  })
  con.on('error', function (err) {
    console.log('db error', err)
    if (err.code == 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect()
    } else {
      throw err
    }
  })
}
handleDisconnect()

var itemClause = function (key, val, opt = '') {
  if (typeof val == 'string') {
    return key + ' ' + (opt === '' ? '=' : opt) + ' ' + "'" + val + "'"
  }
  return key + ' ' + (opt === '' ? '=' : opt) + ' ' + val
}
var lineClause = function (items, delimiter) {
  var ret = ''
  for (var i = 0; i < items.length; i++) {
    ret += itemClause(
      items[i].key,
      items[i].val,
      items[i].opt === undefined || items[i].opt == null ? '' : items[i].opt,
    )
    if (i != items.length - 1) {
      ret += ' ' + delimiter + ' '
    }
  }
  return ret
}
var statement = function (cmd, tbl_name, set_c, where_c, extra = '') {
  return (
    cmd +
    ' ' +
    tbl_name +
    ' ' +
    (set_c == undefined || set_c == '' ? '' : set_c) +
    (where_c == undefined || where_c == '' ? '' : ' where ' + where_c) +
    (extra == undefined || extra == '' ? '' : ' ' + extra)
  )
}
var cmd_promise = function (statement) {
  return new Promise((resolve, reject) => {
    con.query(statement, function (err, rows, fields) {
      if (err) {
        reject(err)
        throw err
      }
      // console.log(results.insertId);
      resolve(rows)
    })
  })
}
var cmd = function (statement, shouldWait = false) {
  // return new Promise((resolve, reject) => {
  con.query(statement, function (err, rows, fields) {
    if (err) {
      // reject(err)
      throw err
    }
    // resolve(rows)
  })
  // })
}
var list = function (statement, shouldWait = false) {
  return new Promise((resolve, reject) => {
    con.query(statement, function (err, rows, fields) {
      if (err) {
        reject(err)
        throw err
      }
      resolve(rows)
    })
  })
}
var convFloat = function (val) {
  return val == undefined || val == null || isNaN(parseFloat(val))
    ? 0
    : parseFloat(val)
}
var convInt = function (val) {
  return val == undefined || val == null || isNaN(parseInt(val))
    ? 0
    : parseInt(val)
}

module.exports = {
  con,
  itemClause,
  lineClause,
  statement,
  cmd,
  cmd_promise,
  list,
  convFloat,
  convInt,
}
