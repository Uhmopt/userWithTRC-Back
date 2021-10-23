const DB = require('../utils/database')

const GetOne = async function (tableName = '', where = {}) {
  const res = Boolean(tableName)
    ? await DB.list('SELECT * FROM ' + tableName + WhereQuery(where))
    : false
  return res && res.length > 0 ? res[0] : false
}

const Getlist = async function (tableName = '', where = {}) {
  const res = Boolean(tableName)
    ? await DB.list('SELECT * FROM ' + tableName + WhereQuery(where))
    : []
  return res
}

const InsertOne = async function (tableName = '', insertData = {}) {
  const res = Boolean(tableName && InsertQuery(insertData))
    ? await DB.list('INSERT INTO ' + tableName + InsertQuery(insertData))
    : false
  return Boolean(res) ? res : false
}

const UpdateOne = async function (tableName = '', updateData = {}, where = {}) {
  const res = Boolean(tableName && UpdateQuery(updateData) && WhereQuery(where))
    ? await DB.list(
        'UPDATE ' + tableName + UpdateQuery(updateData) + WhereQuery(where),
      )
    : false
  return Boolean(res) ? res : false
}

const DeleteOne = async function (tableName = '', where = {}) {
  const res = Boolean(tableName && WhereQuery(where))
    ? await DB.list('DELETE FROM ' + tableName + WhereQuery(where))
    : false
  return Boolean(res) ? res : false
}

const GetByQuery = async function (query = '') {
  const res = Boolean(query) ? await DB.list(query) : false
  return Boolean(res) ? res : false
}

const InsertQuery = function (insertData = {}) {
  let query = ' ( '
  Object.keys(insertData).forEach((item) => {
    query = query + item + ', '
  })
  query = query.slice(0, -2)
  query = query + ' ) VALUES ( '
  Object.values(insertData).forEach((item) => {
    query = query + '"' + item + '"' + ', '
  })
  query = query.slice(0, -2)
  query = query + ' )'
  query = Object.keys(insertData).length === 0 ? '' : query
  return query
}

const UpdateQuery = function (updateData = {}) {
  let query = ' SET '
  for (const [key, value] of Object.entries(updateData)) {
    query = query + key + " = '" + value + "' "
    query = query + ', '
  }
  query = query.slice(0, -2)
  query = Object.keys(updateData).length === 0 ? '' : query
  return query
}

const WhereQuery = function (where = {}) {
  let query = ' WHERE '
  for (const [key, value] of Object.entries(where)) {
    query = query + key + " = '" + value + "' "
    query = query + 'AND '
  }
  query = query.slice(0, -4)
  query = Object.keys(where).length === 0 ? '' : query
  return query
}

const model = {
  GetOne: GetOne,
  Getlist: Getlist,
  InsertOne: InsertOne,
  UpdateOne: UpdateOne,
  DeleteOne: DeleteOne,
  GetByQuery: GetByQuery,
}

module.exports = model
