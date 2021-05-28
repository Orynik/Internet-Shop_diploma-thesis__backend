  const {Router} = require('express')
  const formParser = require('formidable')
  const fs = require('fs')
  const router = Router()
  const colors = require('colors')

  const database = require('../database')
  const errorCode = require("../sqlError")
  const { resolveSoa, resolveSrv } = require('dns')
  const { connect } = require('../database')
  const { send } = require('process')
  const { json } = require('body-parser')
  
  const subsFunctions = require("../subsidiaryFunctionAuth")

  const directoryToSaveImagesProductsLinux = `/home/orynik/Desktop/Projects/Internet-Shop_diploma-thesis__backend/images/products/`;
  const directoryToSaveImagesProductsWindows = `C:\\Users\\Orynik\\Desktop\\Диплом\\Internet-Shop_diploma-thesis__backend\\images\\products\\`;
  const URLImageServer = `http://localhost:4444/img/`
  //TODO: Написать обработчики для обработки респонсов

  function checkErrorDB(mysqlErr,res){
    for(const sqlErr in errorCode){
      if(mysqlErr.code == sqlErr){
        if(sqlErr == "ER_DATA_TOO_LONG"){
          res.status(400).send(sqlErr).end()
          break
        }if(sqlErr == "ER_DUP_KEY"){
          res.status(400).send(sqlErr).end()
          break
        }if(sqlErr == "ER_TRUNCATED_WRONG_VALUE"){
          console.log("done")
          res.status(400).send(sqlErr).end()
          break
        }else{
          console.log(sqlErr)
          res.sendStatus(500)
          break
        }
      }
    }
  }

  async function isHavePermission(userCookie){
    if(userCookie != undefined){
        userCookie = userCookie.split(':')[1].split(".")[0]
        let result = subsFunctions.getUserName(userCookie).then(
          (res) => {
            return subsFunctions.getPermissionVariable(res).then(
              (permissionName) => {
                return permissionName
              },
              (err) =>{
                // Обработка ошибки базы данных
              }
            )
          },
          (err) => {
            if(err == null){
              console.log("Not found user")
              return false
            }else{
              // Обработка ошибки базы данных
            }
          }
        )
        return await result.then(
            (permissionName) => {
              if(permissionName == "Admin"){
                return true
              }
              else{
                return false
              }
            })
    }
    console.log(false)
  }

  router.post("/singup", async (req,res) =>{
    console.log(req.body.FirstName)
    console.log(req.body)
    console.log(`insert into users (Login,LastName,FirstName,Tel,Password,Permission)
    value(
      '${req.body.Login}',
      '${req.body.LastName}',
      '${req.body.FirstName}',
      ${req.body.Phone},
      '${req.body.Password}',
      "User")`)

    database.query(`insert into users (Login,LastName,FirstName,Tel,Password,Permission)
    value(
      '${req.body.Login}',
      '${req.body.LastName}',
      '${req.body.FirstName}',
      ${req.body.Phone},
      '${req.body.Password}',
      "User")`
    ,function(err,result,fields){
      if (err){
        console.log(err)
        res.status(500).send(String(err.errno)).end;
      }else{
        res.sendStatus(201)
      }
    })
  })

  router.post("/signin", async (req,res) =>{
    const username = req.body.Login;
    const password = req.body.Password;
    database.query(`select Login,Password from users where login = '${username}' and password = '${password}'`
    ,function(err,result,fields){
      if(result.length > 0){
        req.session.User = username
        res.sendStatus(201)
      }else{
        res.status(401).send("Error: User does not exist");
      }
    })
  })

  router.get("/auth", async (req,res) =>{
    if(req.cookies["connect.sid"] != undefined){
      const cookie = req.cookies["connect.sid"].split(':')[1].split(".")[0]
      database.query(`Select data from sessions where session_id = "${cookie}"`,async (err,result,fields) =>{
        if(result === undefined){
          res.sendStatus(401)
        }else{
          const username = JSON.parse(result[0].data).User
          res.status(200).send(username);
        }
      })
    }
    else{
      res.sendStatus(401)
    }
  })

  router.get("/checkPermission", async (req,res) => {
    if(await isHavePermission(req.cookies["connect.sid"]) == true) res.status(201).send("Authorized")
    else{
      res.sendStatus(401)
    }
  })

  router.get("/logout", async (req,res) => {
    if(req.cookies["connect.sid"] != undefined){
      req.session.destroy()
      res.clearCookie("connect.sid")
      res.sendStatus(200)
    }
  })

  router.post("/cart", async (req,res) => {
    let connectSid = undefined;

    if(req.cookies['connect.sid']){
      console.log('exist!')
      connectSid = req.cookies['connect.sid']

    }else{
      console.log(req.session)
      console.log(req.cookies['connect.sid'])
    }

    // let cart = req.body;
    // database.query(`select * from motors
    // cross join products
    // where products.Name = '${cart.Name}' AND motors.Name = '${cart.Name}' AND motors.Serial = '${cart.Serial}' AND products.Serial = '${cart.Serial}' `,function(err,result  ,fields){
    //   if (err){
    //     console.log(err)
    //   }
    //   result.push({
    //     count: 1,
    //     Date: Date.now(),
    //   })
    //   console.log(result)
    // })

    res.sendStatus(201)
  })

  router.get('/cart', async (req,res) => {
    if(req.cookies['connect.sid'] != undefined){

    }
  })

  //RESTful Serials table

  router.get('/serials',  async (req,res) => {
    if(isHavePermission(req.cookies["connect.sid"])) res.sendStatus(401)
    else{
      if(req.query.id > 0 && req.query.id != undefined){
        database.query(`select id,Serial from Serials where id = \'${req.query.id}\'`,function(err,result,fields){
          if (err){
            res.status(500).send(err)
          }
          res.send(JSON.stringify(result))
        })
      }else{
        database.query('select id,Serial from Serials',function(err,result,fields){
          if (err){
            res.status(500).send(err)
          }
          res.status(200).send(JSON.stringify(result))
        })
      }
    }
  })

  router.post('/serials',  async (req,res) => {
    console.log(req.body.Serial)
    database.query(`insert into Serials(serial) values (\'${req.body.Serial}\')`,function(err,result,fields){
      if (err){
      checkErrorDB(err,res)
      }else{
        res.sendStatus(201)
      }
    })
  })

  router.put('/serials', async (req,res) =>{
    database.query(`update serials set Serial = '${req.body.Serial}' where id = '${req.body.id}'`, function(err,result,fields){
      if (err){
        console.log("\n")
        for(var k in err){
            console.log(`${k}`.red + `: ${err[k]}`)
        }
        console.log("\n")
        res.sendStatus(400)
      }

      res.sendStatus(202)
    })
  })

  router.delete('/serials', async (req,res) =>{
    database.query(`delete from Serials where id = '${req.query.id}'`, function(err,result,fields){
      if (err){
        console.log(err)
        res.status(500).send("Ошибка: Некорректный id")
      }else{
        res.sendStatus(204)
      }
    })
  })

  //RESTful Manufacturers table

  router.get('/manufacturers',  async (req,res) => {
    if(req.query.id >= 0 && req.query.id != undefined){
      database.query(`select id,Company,Country,Tel,Email,ZipCode,Street,City,Building from manufacturers where id = '${req.query.id}'`,function(err,result,fields){
          if (err){
            console.log(err)
            res.sendStatus(500)
          }

        res.send(JSON.stringify(result))
      })
    }else{
      database.query('select id,Company,Country,Tel,Email,ZipCode,Street,City,Building from manufacturers',function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }

        const requestData = JSON.stringify(result)

        res.send(requestData)
      })
    }
  })

  router.post('/manufacturers',  async (req,res) => {
    database.query(`insert into manufacturers(Company,Country,Tel,Email,ZipCode,Street,City,Building) values (\'${req.body.Company}\',\'${req.body.Country}\',\'${req.body.Tel}\',\'${req.body.Email}\',\'${req.body.ZipCode}\',\'${req.body.Street}\',\'${req.body.City}\',\'${req.body.Building}\')`,function(err,result,fields){
      if (err){
        checkErrorDB(err,res)
      }else{
        res.sendStatus(201)
      }
    })
  })

  router.put('/manufacturers', async (req,res) =>{
    database.query(`update manufacturers set Company = \'${req.body.Company}\', Country = \'${req.body.Country}\',Email = \'${req.body.Email}\',ZipCode = \'${req.body.ZipCode}\',Street = \'${req.body.City}\',City = \'${req.body.City}\', Building = \'${req.body.Building}\'  , Tel = \'${req.body.Tel}\' where id = ${req.body.id}`, function(err,result,fields){
      if (err){
        console.log("\n")
        for(var k in err){
            console.log(`${k}`.red + `: ${err[k]}`)
        }
        console.log("\n")
        res.sendStatus(400)
      }

      res.sendStatus(200)
    })
  })

  router.delete('/manufacturers', async (req,res) =>{
    database.query(`delete from manufacturers where id = '${req.query.id}'`, function(err,retult,fields){
      if (err){
        console.log(err)
        res.status(500).send("Ошибка: Некорректный id")
      }else{
        res.sendStatus(204)
      }
    })
  })

  //RESTful Motors table

  router.get('/motors',  async (req,res) => {
    if(req.query.id > 0 && req.query.id != undefined){
      database.query(`select id,Name,Serial,OperatingVoltage,Power,RotationSpeed,Perfomance,PowerFactor, MultiplicityMaximum, Sliding from motors where id = ${req.query.id}`,function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }

        const requestData = JSON.stringify(result)

        res.send(requestData)
      })
    }if(req.query.name && req.query.serial){
      console.log(`select id,Name,Serial,OperatingVoltage,Power,RotationSpeed,Perfomance,PowerFactor, MultiplicityMaximum, Sliding from motors where Name = ${req.query.name} and Serial = ${req.query.serial}`.red)
      database.query(`select id,Name,Serial,OperatingVoltage,Power,RotationSpeed,Perfomance,PowerFactor, MultiplicityMaximum, Sliding from motors where Name = '${req.query.name}' and Serial = '${req.query.serial}'`,function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }

        const requestData = JSON.stringify(result)

        res.send(requestData)
      })
    }else{
      database.query('select id,Name,Serial,OperatingVoltage,Power,RotationSpeed,Perfomance,PowerFactor, MultiplicityMaximum, Sliding from motors',function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }

        const requestData = JSON.stringify(result)

        res.send(requestData)
      })
    }
  })

  router.post('/motors', async (req,res) =>{
    database.query(`insert into motors(Name,Serial,OperatingVoltage,Power,RotationSpeed,Perfomance, PowerFactor, MultiplicityMaximum, Sliding) values (\'${req.body.Name}\',\'${req.body.Serial}\',${req.body.OperatingVoltage},${req.body.Power},${req.body.RotationSpeed},${req.body.Perfomance},${req.body.PowerFactor},${req.body.MultiplicityMaximum},${req.body.Sliding})`, function(err,result,field){
      if (err){
        checkErrorDB(err,res)
      }else{
        res.sendStatus(201)
      }
    })
  })

  router.put('/motors', async (req,res) =>{
    database.query(`update motors set Name = '${req.body.Name}', Serial = '${req.body.Serial}', OperatingVoltage = '${req.body.OperatingVoltage}', Power = '${req.body.Power}', RotationSpeed = '${req.body.RotationSpeed}' ,Perfomance = ${req.body.Perfomance}, PowerFactor = ${req.body.PowerFactor} where id = ${req.body.id}`, function(err,result,fields){
      if (err){
        console.log("\n")
        for(var k in err){
            console.log(`${k}`.red + `: ${err[k]}`)
        }
        console.log("\n")
        res.sendStatus(400)
      }else{
        res.sendStatus(200)
      }
    })
  })

  router.delete('/motors', async (req,res) =>{
    database.query(`delete from motors where id = '${req.query.id}'`, function(err,retult,fields){
      if (err){
        console.log(err)
        res.status(500).send("Ошибка: Некорректный id")
      }else{
        res.sendStatus(204)
      }
    })
  })

  //RESTful Products table

  router.get('/products', async (req,res) => {
    if(req.query.id > 0 && req.query.id != undefined){

      database.query(`select id,Name,Serial,LintToImage,Manufacturer,Description,Price from Products where id = ${req.query.id}`,function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }
    
        const requestData = JSON.stringify(result)
    
        res.send(requestData)
      })
    }else{
      console.log(req.query.id)
      database.query(`select id,Name,Serial,LintToImage,Manufacturer,Description,Price from Products`,function(err,result,fields){
        if (err){
          console.log(err)
          res.sendStatus(500)
        }
    
        const requestData = JSON.stringify(result)
    
        res.send(requestData)
      })
    }
  })

  router.post('/products',  async (req,res) => {
    let form = new formParser.IncomingForm();


    form.parse(req, function(err, fields, files){
        if(err) console.error("Oops");

        console.log(`Insert into products(Name,Serial,LintToImage,Manufacturer,Description,Price)
        values ('${fields.Name}','${fields.Serial}','${URLImageServer}/${fields.Name}.jpg','${fields.Manufacturer}','${fields.Description}',${fields.Price});`)

        database.query(`Insert into products(Name,Serial,LintToImage,Manufacturer,Description,Price)
        values ('${fields.Name}','${fields.Serial}','${URLImageServer}/${fields.Name}.jpg','${fields.Manufacturer}','${fields.Description}',${fields.Price});`,
        function(err,result,fields){
          if (err) {
            res.sendStatus(500)
            throw new Error(err)
          }
          console.log("Writed to db success".cyan)
          res.sendStatus(201)
        })
rs
        fs.copyFile(
          files.file.path,
          `${directoryToSaveImagesProductsWindows}${fields.Name}.jpg`,
          (err) => {
            if(err) throw new Error(err)
            console.log('file moved'.red)
          })
  })
  });

  router.put('/products', async (req,res) =>{
    let form = new formParser.IncomingForm();

    form.parse(req, function(err, fields, files){
      fs.copyFile(
        files.file.path,
        `${directoryToSaveImagesProductsWindows}${fields.Name}.jpg`,
        (err) => {
          if(err) throw err
          console.log('file moved'.red)
        }
      )

      console.log(`update products set Name = '${fields.name}', Serial = '${fields.serial}', LintToImage = '${URLImageServer}${fields.name}.jpg' ,Manufacturer = '${fields.manufacturer}',Price = ${fields.price} where id = ${fields.id}`.red)
      if (err) throw new Error(err)
      database.query(`update products set Name = '${fields.name}', Serial = '${fields.serial}', LintToImage = '${URLImageServer}${fields.name}.jpg' ,Manufacturer = '${fields.manufacturer}',Price = ${fields.price} where id = ${fields.id}`,
        function(err,result,fields){
          if (err) throw new Error(err)

          res.sendStatus(200)
        })
    })
  })

  router.delete('/products', async (req,res) =>{
    database.query(`delete from products where id = '${req.query.id}'`, function(err,retult,fields){
      if (err){
        console.log("\n")
        for(var k in err){
            console.log(`${k}`.red + `: ${err[k]}`)
        }
        console.log("\n")
        res.sendStatus(400)
      }else{
        res.sendStatus(204)
      }
    })
  })

  module.exports = router;
