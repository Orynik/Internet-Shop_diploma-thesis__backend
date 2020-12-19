"use strict"
const mysql = require("mysql2");
const config = require("./config/config")

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.MySQL_host,
  user: config.MySQL_user,
  database: config.MySQL_database,
  password: config.MySQL_password,
});


// Middleware MySQL
pool.getConnection((err, connection) => {
  if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.error('Database connection was closed.')
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
          console.error('Database has too many connections.')
      }
      if (err.code === 'ECONNREFUSED') {
          console.error('Database connection was refused.')
      }
  }
    if (connection) return connection.release()
})

module.exports = pool