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

router.get('/serials',  async (req,res) => {
  database.query('select Serial from Serials',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
  })
})

router.get('/serials',  async (req,res) => {
  database.query('select Serial from Serials',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
  })
})

router.get('/manufacturers',  async (req,res) => {
  database.query('select Company,Location,Number from Manufacturers',function(err,result,fields){
    if (err) throw new Error(err)

    const requestData = JSON.stringify(result)

    res.send(requestData)
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
