const {Router} = require('express')
const formParser = require('formidable')
const database = require('../database')
const fs = require('fs')
const router = Router()

const directoryToSaveImagesProducts = `/home/orynik/Desktop/Projects/Internet-Shop_diploma-thesis__backend/images/products/`;

router.get('/',  async (req,res) => {
  res.send([
    {
    }
  ])
})

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

router.get('/motors',  async (req,res) => {
  database.query('select Name,Serial,MaxPower,MinPower,IsFullSolution,IsEnergySaving from Motors',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
  })
})
//TODO: Написать обработчики для обработки респонсов
router.get('/products', async (req,res) => {
  database.query('select Name,Serial,LintToImage,Manufacturer,Description,Price from Products',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
  })
})

router.post('/products',  async (req,res) => {
  var form = new formParser.IncomingForm();
  form.parse(req, function(err, fields, files){
      if(err) console.error(err);
      console.log(fields);

      fs.copyFile(
        files.file.path,
        `${directoryToSaveImagesProducts}${fields.name}.jpg`,
        (err) => {
          if(err) throw err
          console.log('file moved')
        })

      database.query(`Insert into Products(Name,Serial,LintToImage,Manufacturer,Description,Price)
      values ('${fields.name}','${fields.serial}','${directoryToSaveImagesProducts}${fields.name}.jpg','${fields.manufacturer}','${fields.description}','${fields.price}');`,
      function(err,result,fields){
        if (err) throw new Error(err)
         console.log("Writed to db success")
      })
})});

module.exports = router;
