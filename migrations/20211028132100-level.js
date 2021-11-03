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
  await db.createTable(
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
        defaultValue: 0
      },
      level_user: {
        type: 'int',
        length: 255,
        notNull: true,
        defaultValue: 1
      },
      level_amount: {
        type: 'int',
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
  for( var i=0; i < 17; i++ ){
    db.insert('tb_level', ['level_degree', 'level_user', 'level_amount'], [i, 0, 10], callback)
  }
  
};

exports.down = async function(db) {
  db.dropTable('tb_level', callback)
};

exports._meta = {
  "version": 1
};
