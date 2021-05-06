const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")

const session = require("express-session")
const cookieparser = require("cookie-parser")

const config = require('./config/config')
const router = require('./routes/router')

const app = express();

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors({
  origin: config.AllowOrigins,
  credentials: true
}))

// TODO: Добавить такую строчку настройки
// if (app.get('env') === 'production') {}

app.use(cookieparser());
app.use(
  session({
    secret: config.SECRET_SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    cookie:{
      maxAge: 86400, //86 400 - сутки в секундах
      secure: false,
      sameSite: true
    }
  })
)

app.use('/img',express.static(`${__dirname}/images/products`))
app.use(router)


app.listen(process.env.PORT || config.port,
  () => console.log(`Server started on port ${process.env.PORT || config.port}...`))