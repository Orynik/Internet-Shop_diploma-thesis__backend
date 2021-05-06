const database = require("./database")
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  schema:{
    tableName: sessions,
    columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
  }
}, database);

export default sessionStore