const nodemailer = require("nodemailer")
const config = require("./config/config.js")
async function sendMail(orderData){
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.gmail_login,
        pass:  config.gmail_password,
    },
    secure: false,
  })

  //TODO: Добавить text и html

  let textResult = function(){
      let text = "Заказ:  \n";
      console.log(orderData.backet.length)
      for(let i = 0; i < orderData.backet.length; i++){
        text += `Номер корзины: ${orderData.backet[i].Cart_id}
        Название товара: ${orderData.backet[i].Name}
        Серия товара: ${orderData.backet[i].Serial}
        Производитель: ${orderData.backet[i].Manufacturer}
        Цена: ${orderData.backet[i].Price}
        Количество: ${orderData.backet[i].AmountItems}\n\n`
      }
      return text;
  };

  let options = {
    from: 'Node.js Backend',
    to: 'd.developersharp@gmail.com',
    subject: 'Order' + orderData.username,
    text: textResult() + "Данные для доставки: \n" + orderData.GetFullAddress
  }

  transporter.sendMail(options, function(error,info){
    if(error){
      console.log(error)
      return false
    }else{
      console.log('Email sent: ' + info)
      return true
    }
  })
}

module.exports = sendMail;