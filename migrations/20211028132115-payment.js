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
        length: 255,
        notNull: true,
      },
      pay_to: {
        type: 'int',
        length: 255,
        notNull: true,
      },
      pay_amount: {
        type: 'float',
        length: 11,
        notNull: true,
        defaultValue: 0,
      },
      pay_date: {
        type: 'datetime',
        notNull: true,
        defaultValue: moment().format('YY-MM-DD HH:mm:ss'),
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
