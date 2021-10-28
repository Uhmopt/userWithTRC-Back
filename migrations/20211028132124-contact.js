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

exports.up = function(db, callback) {
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
};

exports.down = function(db) {
  db.dropTable('tb_contact', callback)
};

exports._meta = {
  "version": 1
};
