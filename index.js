require('dotenv').config()

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")

const session = require("express-session")
const cookieparser = require("cookie-parser")
const uuidKey = require("uuid")
const MySQLStore = require("express-mysql-session")(session)

const router = require('./routes/router')
const database = require('./database')

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
    genid: (req) => uuidKey.v4(req),
    secret: process.env.SECRET_SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: {
        maxAge: 86400000, //86 400 - сутки в секундах
        secure: false,
        sameSite: true
    }
}


const app = express();

// TODO: Добавить такую строчку настройки
if (app.get('env') === 'production') {
    session.cookie.secure = true // serve secure cookies
}

app.use(helmet())
    .use(morgan('common'))
    .use(bodyParser.json()).use(cors({
    origin: process.env.ALLOW_ORIGINS,
    credentials: true,
    methods: "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Credentials": true,
}))
    .use(cookieparser())
    .use(session(session_variable))
    .use('/img', express.static(`${__dirname}/images/products`,))
    .use(router)
    .listen(process.env.APP_PORT,
        () => console.log(`Server started on port ${process.env.APP_PORT}...`))

module.exports = app;