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

exports.up = function (db, callback) {
  db.createTable(
    'tb_setting',
    {
      set_id: {
        type: 'int',
        primaryKey: true,
        notNull: true,
        autoIncrement: true,
      },
      set_superior: {
        type: 'int',
        notNull: true,
        length: 11,
      },
      set_register_allowed: {
        type: 'int',
        notNull: true,
        defaultValue: 1,
        length: 1,
      },
      set_admin_email: {
        type: 'string',
        notNull: true,
        defaultValue: '',
        length: 255,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
}

exports.down = function (db, callback) {
  db.dropTable('tb_setting', callback)
}

exports._meta = {
  version: 1,
}
