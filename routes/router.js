const {Router} = require('express')
const formParser = require('formidable')
const database = require('../database')
const fs = require('fs')
const router = Router()

const colors = require('colors')

const directoryToSaveImagesProducts = `/home/orynik/Desktop/Projects/Internet-Shop_diploma-thesis__backend/images/products/`;
const directoryToSaveImagesProductsWindows = `C:\\Users\\Orynik\\Desktop\\Диплом\\Internet-Shop_diploma-thesis__backend\\images\\products\\`;
//TODO: Написать обработчики для обработки респонсов

//RESTful Serials table

router.get('/serials',  async (req,res) => {

  if(req.query.id > 0 && req.query.id != undefined){
    database.query(`select id,Serial from Serials where id = '${req.query.id}'`,function(err,result,fields){
      if (err) throw new Error(err)

      res.send(JSON.stringify(result))
    })
  }else{
    database.query('select id,Serial from Serials',function(err,result,fields){
      if (err) throw new Error(err)

      res.send(JSON.stringify(result))
    })
  }

})

router.post('/serials',  async (req,res) => {
  database.query(`insert into Serials(serial) values ('${req.body.Serial}')`,function(err,result,fields){
    if (err) throw new Error(err)

    res.sendStatus(201)
  })
})

router.put('/serials', async (req,res) =>{
  database.query(`update serials set Serial = '${req.body.Serial}' where id = '${req.body.id}'`, function(err,result,fields){
    if (err) throw new Error(err)

    res.sendStatus(200)
  })
})

router.delete('/serials', async (req,res) =>{
  database.query(`delete from Serials where id = '${req.query.id}'`, function(err,result,fields){
    if (err) throw new Error(err)

    res.sendStatus(204)
  })
})

//RESTful Manufacturers table

router.get('/manufacturers',  async (req,res) => {
  if(req.query.id >= 0 && req.query.id != undefined){
    database.query(`select id,Company,Location,Tel from manufacturers where id = '${req.query.id}'`,function(err,result,fields){
      if (err) throw new Error(err)

      res.send(JSON.stringify(result))
    })
  }else{
    database.query('select id,Company,Location,Tel from manufacturers',function(err,result,fields){
      if (err) throw new Error(err)

      const requestData = JSON.stringify(result)

      res.send(requestData)
    })
  }
})

router.post('/manufacturers',  async (req,res) => {
  database.query(`insert into manufacturers(Company,Location,Tel) values ('${req.body.Company}','${req.body.Location}','${req.body.Tel}')`,function(err,result,fields){
    if (err) throw new Error(err)
    
    res.sendStatus(201)
  })
})

router.put('/manufacturers', async (req,res) =>{
  database.query(`update manufacturers set Company = '${req.body.Company}', Location = '${req.body.Location}', Tel = '${req.body.Tel}' where id = '${req.body.id}'`, function(err,result,fields){
    if (err) throw new Error(err)

    res.sendStatus(200)
  })
})

router.delete('/manufacturers', async (req,res) =>{
  database.query(`delete from manufacturers where id = '${req.query.id}'`, function(err,retult,fields){
    if (err) throw new Error(err)

    res.sendStatus(204)
  })
})

//RESTful Motors table

router.get('/motors',  async (req,res) => {
  if(req.query.id > 0 && req.query.id != undefined){
    database.query(`select id,Name,Serial,MaxPower,MinPower,IsFullSolution,IsEnergySaving from motors where id = ${req.query.id}`,function(err,result,fields){
      if (err) throw new Error(err)

      const requestData = JSON.stringify(result)

      res.send(requestData)
    })
  }else{
    database.query('select id,Name,Serial,MaxPower,MinPower,IsFullSolution,IsEnergySaving from motors',function(err,result,fields){
      if (err) throw new Error(err)

      const requestData = JSON.stringify(result)

      res.send(requestData)
    })
  }
})

router.post('/motors', async (req,res) =>{
  database.query(`insert into motors(Name,Serial,MaxPower,MinPower,IsFullSolution,IsEnergySaving) values ('${req.body.Name}','${req.body.Serial}','${req.body.MaxPower}','${req.body.MinPower}',${req.body.IsFullSolution},${req.body.IsEnergySaving})`, function(err,result,field){
    if (err) throw new Error(err)

    res.send(JSON.stringify(result))
  })
})

router.put('/motors', async (req,res) =>{
  console.log(`update motors set Name = '${req.body.Name}', Serial = '${req.body.Serial}', MaxPower = '${req.body.MaxPower}' ,MinPower = '${req.body.MinPower}',IsFullSolution = ${req.body.IsFullSolution}, IsEnergySaving = ${req.body.IsEnergySaving} where id = ${req.body.id}`)

  database.query(`update motors set Name = '${req.body.Name}', Serial = '${req.body.Serial}', MaxPower = '${req.body.MaxPower}' ,MinPower = '${req.body.MinPower}',IsFullSolution = ${req.body.IsFullSolution}, IsEnergySaving = ${req.body.IsEnergySaving} where id = ${req.body.id}`, function(err,result,fields){
    if (err) throw new Error(err)

    res.sendStatus(200)
  })
})

router.delete('/motors', async (req,res) =>{
  database.query(`delete from motors where id = '${req.query.id}'`, function(err,retult,fields){
    if (err) throw new Error(err)

    res.sendStatus(204)
  })
})


router.get('/products', async (req,res) => {
  database.query('select id,Name,Serial,LintToImage,Manufacturer,Description,Price from Products',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
  })
})

router.post('/products',  async (req,res) => {
  let form = new formParser.IncomingForm();


  form.parse(req, function(err, fields, files){
      if(err) console.error(err);

      fs.copyFile(
        files.file.path,
        `${directoryToSaveImagesProductsWindows}${fields.Name}.jpg`,
        (err) => {
          if(err) throw new Error(err)
          console.log('file moved'.red)
        })

      database.query(`Insert into products(Name,Serial,LintToImage,Manufacturer,Description,Price)
      values ('${fields.Name}','${fields.Serial}','${directoryToSaveImagesProducts}${fields.Name}.jpg','${fields.Manufacturer}','${fields.Description}',${fields.Price});`,
      function(err,result,fields){
        if (err) {
          res.sendStatus(500)
          throw new Error(err)
        }
         console.log("Writed to db success".cyan)
         res.sendStatus(201)
      })
})
});

router.put('/products', async (req,res) =>{
  // fs.copyFile(
  //   files.file.path,
  //   `${directoryToSaveImagesProductsWindows}${fields.Name}.jpg`,
  //   (err) => {
  //     if(err) throw err
  //     console.log('file moved'.red)
  //   }
  // )

  let form = new formParser.IncomingForm();

  form.parse(req, function(err, fields, files){
    console.log(`update products set Name = '${fields.name}', Serial = '${fields.serial}', LintToImage = '${directoryToSaveImagesProductsWindows}${fields.name}.jpg' ,Manufacturer = '${fields.manufacturer}',Price = ${fields.price} where id = ${fields.id}`.red)
    if (err) throw new Error(err)
    database.query(`update products set Name = '${fields.name}', Serial = '${fields.serial}', LintToImage = '${directoryToSaveImagesProductsWindows}${fields.name}.jpg' ,Manufacturer = '${fields.manufacturer}',Price = ${fields.price} where id = ${fields.id}`,
      function(err,result,fields){
        if (err) throw new Error(err)

        res.sendStatus(200)
      })
  })
})

router.delete('/products', async (req,res) =>{
  console.log(req.query.id)
  database.query(`delete from products where id = '${req.query.id}'`, function(err,retult,fields){
    if (err) throw new Error(err)

    res.sendStatus(204)
  })
})

module.exports = router;
