'use strict'

var dbm
var type
var seed
var moment = require('moment')

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}


exports.up = function (db, callback) {

  db.createTable('tests', {
    columns: {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: 'string'  // shorthand notation
    },
    ifNotExists: true
  }, callback);


  db.createTable(
    'tb_user',
    {
      user_id: {
        type: 'int',
        length: 255,
        primaryKey: true,
        autoIncrement: true,
      },
      user_email: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      user_password: {
        type: 'string',
        notNull: true,
        length: 255,
      },
      user_level: {
        type: 'int',
        notNull: true,
        length: 2,
        defaultValue: 0,
      },
      user_register_date: {
        type: 'int',
        defaultValue: moment().unix(),
      },
      user_role: {
        type: 'int',
        defaultValue: 0,
        notNull: true,
      },
      user_token: {
        type: 'text',
        defaultValue: '',
      },
      user_is_verified: {
        type: 'tinyint',
        defaultValue: 0,
        length: 1,
      },
      user_expires: {
        type: 'int',
        defaultValue: moment().unix() + 600,
      },
      user_wallet_address: {
        type: 'string',
        notNull: true,
        defaultValue: '',
        length: 255,
      },
      user_verify_code: {
        type: 'int',
        notNull: true,
        defaultValue: 0,
      },
      user_del: {
        type: 'int',
        length: 1,
        notNull: true,
        defaultValue: 0,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
  db.createTable(
    'tb_revenue',
    {
      revenue_id: {
        type: 'int',
        length: 255,
        primaryKey: true,
        autoIncrement: true,
      },
      revenue_user: {
        type: 'int',
        length: 255,
      },
      revenue_date: {
        type: 'date',
      },
      revenue_amount: {
        type: 'int',
        defaultValue: 255,
        notNull: true,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
  db.createTable(
    'tb_level',
    {
      level_id: {
        type: 'int',
        length: 255,
        primaryKey: true,
        autoIncrement: true,
      },
      level_degree: {
        type: 'int',
        length: 11,
      },
      level_image: {
        type: 'string',
        length: 255,
      },
      user_password: {
        type: 'string',
        notNull: true,
        length: 255,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
  db.createTable(
    'tb_invite',
    {
      invite_id: {
        type: 'int',
        length: 11,
        primaryKey: true,
        autoIncrement: true,
      },
      invite_user: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      invite_link: {
        type: 'string',
        notNull: true,
        length: 255,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
  db.createTable(
    'tb_contact',
    {
      contact_id: {
        type: 'int',
        length: 255,
        primaryKey: true,
        autoIncrement: true,
      },
      contact_user: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      contact_email: {
        type: 'string',
        notNull: true,
        length: 255,
      },
      contact_id: {
        type: 'string',
        notNull: true,
        length: 255,
      },
      contact_theme: {
        type: 'string',
        notNull: true,
        length: 255,
      },
      contact_text: {
        type: 'string',
        notNull: true,
        length: 255,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
  db.createTable(
    'tb_payment',
    {
      payment_id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
      },
      payment_from: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      payment_to: {
        type: 'string',
        length: 255,
        notNull: true,
      },
      payment_hash: {
        type: 'string',
        length: 255,
        notNull: true,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
}

exports.down = function (db, callback) {
  db.dropTable('user', callback)
}

exports._meta = {
  version: 1,
}
