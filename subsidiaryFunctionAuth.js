const database = require("./database")

module.exports = helpers = {
  getUserName: function(userCookie){
    return new Promise(function(resolve,reject){
      database.query(`Select data from sessions where session_id = "${userCookie}"`, async (err,result,fields) => {
        if(err) throw new Error(err)
        if(result.length == 0) resolve(null)
        else resolve(JSON.parse(result[0].data).User)
      })
    })
  },
  getPermissionVariable: function(userName){
    return new Promise(function(resolve,reject){
      database.query(`Select Permission from users where Login = "${userName}"`, async (err,result,fields) =>{
          if(err) throw new Error(err)
          if(result.length == 0) reject("Not found")
          else resolve(result[0].Permission)
        })
    })
  }
}