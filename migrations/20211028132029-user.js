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

exports.up = async function (db, callback) {
  db.createTable(
    'tb_user',
    {
      user_id: {
        type: 'int',
        length: 255,
        primaryKey: true,
        notNull: true,
        autoIncrement: true,
      },
      user_rid: {
        type: 'int',
        length: 255,
        notNull: true,
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
        notNull: true,
        defaultValue: moment().unix(),
      },
      user_role: {
        type: 'int',
        defaultValue: 0,
        notNull: true,
      },
      user_state: {
        type: 'int',
        defaultValue: 0,
        notNull: true,
      },
      user_token: {
        type: 'text',
        notNull: true,
        defaultValue: '',
      },
      user_is_verified: {
        type: 'int',
        notNull: true,
        defaultValue: 0,
        length: 1,
      },
      user_expires: {
        type: 'int',
        notNull: true,
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
      user_invited_from: {
        type: 'string',
        notNull: true,
        defaultValue: '',
        length: 255,
      },
      user_superior_id: {
        type: 'int',
        notNull: true,
        defaultValue: 0,
        length: 11,
      },
      user_del: {
        type: 'int',
        length: 1,
        notNull: true,
        defaultValue: 0,
      },
      user_allow_update: {
        type: 'int',
        notNull: true,
        defaultValue: 1,
        length: 1,
      },
      user_allow_login: {
        type: 'int',
        notNull: true,
        defaultValue: 1,
        length: 1,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
}

exports.down = async function (db, callback) {
  db.dropTable('tb_user', callback)
}

exports._meta = {
  version: 1,
}
