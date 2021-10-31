'use strict';

var dbm;
var type;
var seed;
var moment = require('moment')

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
    'tb_payment',
    {
      pay_id: {
        type: 'int',
        primaryKey: true,
        autoIncrement: true,
      },
      pay_from: {
        type: 'int',
        length: 11,
        notNull: true,
      },
      pay_to: {
        type: '11',
        length: 255,
        notNull: true,
      },
      pay_result: {
        type: 'string',
        length: 50,
        notNull: true,
      },
      pay_confirmed: {
        type: 'int',
        length: 1,
        defaultValue: 0,
        notNull: true,
      },
      pay_amount: {
        type: 'int',
        length: 20,
        notNull: true,
        defaultValue: 0,
      },
      pay_time: {
        type: 'timestamp',
        notNull: true,
      },
      pay_hash: {
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
};

exports.down = async function(db) {
  db.dropTable('tb_payment', callback)
};

exports._meta = {
  "version": 1
};
