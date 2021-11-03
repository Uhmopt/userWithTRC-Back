'use strict'

var dbm
var type
var seed

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
    'tb_contact',
    {
      contact_id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
      },
      contact_user: {
        type: 'int',
        length: 255,
        notNull: true,
        defaultValue: 0,
      },
      contact_rid: {
        type: 'int',
        length: 255,
        notNull: true,
        defaultValue: 2000,
      },
      contact_verify_code: {
        type: 'int',
        length: 11,
        notNull: true,
        defaultValue: 0,
      },
      contact_is_verified: {
        type: 'int',
        length: 11,
        notNull: true,
        defaultValue: 0,
      },
      contact_theme: {
        type: 'string',
        length: 255,
        notNull: true,
        defaultValue: '',
      },
      contact_text: {
        type: 'string',
        length: 500,
        notNull: true,
        defaultValue: '',
      },
      contact_email: {
        type: 'string',
        length: 255,
        notNull: true,
        defaultValue: '',
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
}

exports.down = async function (db) {
  db.dropTable('tb_contact', callback)
}

exports._meta = {
  version: 1,
}
