const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port:process.env.DB_PORT,
  user: process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:'IOT',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
module.exports=connection;