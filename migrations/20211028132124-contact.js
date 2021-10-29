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
        length: 11,
        notNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
      contact_user: {
        type: 'int',
        length: 255,
        defaultValue: 0,
        notNull: true,
      },
      contact_email: {
        type: 'string',
        notNull: true,
        defaultValue: "",
        length: 255,
      },
      contact_rid: {
        type: 'int',
        notNull: true,
        length: 11,
        defaultValue: "",
      },
      contact_theme: {
        type: 'string',
        notNull: true,
        defaultValue: "",
        length: 255,
      },
      contact_text: {
        type: 'string',
        defaultValue: "",
        notNull: true,
        length: 500,
      },
      contact_verify_code: {
        type: 'int',
        defaultValue: 0,
        notNull: true,
        length: 11,
      },
      contact_is_verified: {
        type: 'int',
        defaultValue: 0,
        notNull: true,
        length: 1,
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
