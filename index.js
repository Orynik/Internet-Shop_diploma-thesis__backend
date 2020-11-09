"use strict";

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
const mysql = require("mysql2");

const config = require('./config/config')
const router = require('./routes/router')

const app = express();

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.use(router)

// MySQL Connect

const connection = mysql.createConnection({
  host: "",
  user: "",
  database: "",
  password: "",
});

 connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });
  // закрытие подключения
  connection.end(function(err) {
    if (err) {
      return console.log("Ошибка: " + err.message);
    }
    console.log("Подключение закрыто");
  });

app.listen(process.env.PORT || config.port,
  () => console.log(`Server started on port 8081...`))