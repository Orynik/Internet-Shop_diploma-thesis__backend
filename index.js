const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")

const session = require("express-session")
const cookieparser = require("cookie-parser")
const uuidKey = require("uuid")
const MySQLStore = require("express-mysql-session")(session)
// const Passport = require("passport")

const config = require('./config/config')
const router = require('./routes/router')
const database = require('./database')

const app = express();

app.use(helmet())
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(cors({
  origin: config.AllowOrigins,
  credentials: true,
  methods: "GET,PUT,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": true,
  allowedHeaders:[
    "content-type"
  ]
}))

app.use(cookieparser());

function genuuid(req){
  return uuidKey.v4()
}

let sessionStore = new MySQLStore({
  checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
  expiration: 86400000,// The maximum age of a valid session; milliseconds.
  createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
  schema: {
      tableName: 'sessions',
      columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data',
      }
  }
}, database);

let session_variable = {
  genid: function(req) {
    return genuuid(req) // use UUIDs for session IDs
  },
  secret: config.SECRET_SESSION_KEY,
  saveUninitialized: false,
  resave: false,
  store: sessionStore,
  cookie:{
    maxAge: 86400000, //86 400 - сутки в секундах
    secure: false,
    sameSite: true
  }
}

// TODO: Добавить такую строчку настройки
if (app.get('env') === 'production') {
  session.cookie.secure = true // serve secure cookies
}

app.use(
  session(session_variable)
)

app.use('/img',express.static(`${__dirname}/images/products`))
app.use(router)


app.listen(process.env.PORT || config.port,
  () => console.log(`Server started on port ${process.env.PORT || config.port}...`))