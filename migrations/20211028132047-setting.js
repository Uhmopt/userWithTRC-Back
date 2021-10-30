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
    'tb_setting',
    {
      set_id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
      },
      set_item_name: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      set_item_value: {
        type: 'int',
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

// function insertDefaultValue(db) {
//   db.insert(tb_setting, [set_item_name, set_item_value], ['specified_user_id', '0'], callback)
//   db.insert(tb_setting, [set_item_name, set_item_value], ['register_allowed', '1'], callback)
//   db.insert(tb_setting, [set_item_name, set_item_value], ['contact_email', 'user_upgrade@gmail.com'], callback)
// }

exports.down = async function (db, callback) {
  await db.dropTable('tb_setting', callback)
}

exports._meta = {
  version: 1,
}
