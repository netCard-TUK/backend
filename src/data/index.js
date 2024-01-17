//import mysql from "mysql2/promise";
require("dotenv").config();
const mysql = require("mysql2");

exports.connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

exports.pool = (queryString, params) => {
  return new Promise((resolve, reject) => {
    exports.connection.query(queryString, params, (err, rows, fields) => {
      err ? reject(err) : resolve(rows);
    });
  });
};
