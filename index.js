const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")

const config = require('./config/config')
const router = require('./routes/router')

const app = express();

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors({
  origin: config.AllowOrigins,
  credentials: true
}))

app.use('/img',express.static(`${__dirname}/images/products`))
app.use(router)


app.listen(process.env.PORT || config.port,
  () => console.log(`Server started on port ${process.env.PORT || config.port}...`))