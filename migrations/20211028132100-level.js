'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db, callback) {
  db.createTable(
    'tb_level',
    {
      level_id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
      },
      level_degree: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      level_user: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      level_amount: {
        type: 'float',
        length: 11,
        notNull: true,
        defaultValue: 0,
      },
    },
    function (err) {
      if (err) return callback(err)
      return callback()
    },
  )
};

exports.down = async function(db) {
  db.dropTable('tb_level', callback)
};

exports._meta = {
  "version": 1
};
