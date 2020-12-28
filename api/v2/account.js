const moment = require('moment'),
Router = require('express-promise-router'),
router = new Router(),
bcrypt = require('bcrypt'),
jwt = require('jsonwebtoken'),

account = require('./models/models_account'),
{ checkJWT } = require('./libs/auth'),
async = require('async'),
libs = require('./libs/functions'),
request = require('request'),
conf = require('../../config'),
nameRoute = '/account/';


//Перечень ссылок используемых в работе
router.all(nameRoute, async(req, res)=>{
  res.status(200).json({"status":200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
    "data":{
      "login":{
        "query":"post",
        "email":"string",
        "password":"string",
        "description": "Authorization using the service"
        },
        "register":{
          "query":"post",
          "email":"post",
          "password":"string",
          "description": "Register a new user to the system"
        },
        "registrEmail":{
          "email": "email",
          "lat": "floar", //координаты GPS
          "long":"float", //координаты GPS
          "description": "Test function for user registration with GPS coordinates transmission"
        }
    }  
  });
})

router.post(nameRoute+'login', async (req, res) => {
  try{    
    let checkEmail = await libs.checkEmail(req.body.email) 
   
    if (Boolean(checkEmail)){
      //Проверка на пустой пароль
      let passwd = checkEmail.password;
      if ( passwd === null) passwd = '0';
      const hash_db = (passwd);
      let salt = bcrypt.genSaltSync(256);
      if (bcrypt.compareSync(req.body.password, hash_db, salt)){
          //Попробуем получить JWT токен
          let token = await jwt.sign({id:checkEmail.id}, conf.jwt_params.jwt_secret, {expiresIn:conf.jwt_params.jwt_time});
          res.status(200).send({result: 200, auth: true, token:token, expiresIn:conf.jwt_params.jwt_time ,email: req.body.email, text:'Login OK'})
        }else{
          res.status(401).send({result: 401, auth: false, token:null, expiresIn:0, email: req.body.email, text:'Error password'})
        }
    } else { 
      res.status(400).send({result: 400, auth: true, token:null, expiresIn:0,  email: req.body.email, text:'Email not found'})
    }

}
catch(err) {
    res.status(500).send({ auth: false, error: err });
    console.log('auth: false', err);
    return;
}
  });

  router.post(nameRoute+'registrEmail', async(req, res)=>{
    try{
      const email = await libs.checkEmail(req.body.email)
      if (!Boolean(email)){
        //
        //тут сообщаем что ваш емаил зарегистрирован
        //const insertEmail = await libs.insertEmail(req.body.email) 
        let insertEmail = await libs.execQuery(account.insertEmail, [req.body.email, req.body.lat, req.body.long], global.pool_terminal)
        console.log('insertEmail', insertEmail);
        if (Boolean(insertEmail)){
        res.status(200).send({result: 201, auth: true, exist:false, email: req.body.email, text:'new email', lat:req.body.lat, long: req.body.long})
        }else{
        res.status(400).send({result: 400, auth: true, exist:false, email: req.body.email, text:'error insert email '})
        }
      }else{
        //Тут делаем регистрацию email
        res.status(200).send({result: 200, auth: true, exist: true, email: email, text:'email exist'})
      }
      return email;
      /*global.poolFB.get(async function (err, db) {
        db.query(account.checkLogin.text, [req.body.email], async function(error, result) {
          if (error) throw (error);
          // IMPORTANT: release the pool connection
            let h = await result;
            //console.log(h[0].FIO);
            if (!Boolean(h[0])) {
              //Тут делаем регистрацию данной информации
            } else {
              res.status(400).send({result: 300, auth:false, jwt: null, error: 'Email exist'});
            }
        //return res;
        db.detach(); 
        })
    })*/
    }
    
      catch(err) {
        res.status(500).send({ auth: false, error: err });
        console.log('auth: false', err);
        return;
    }

  })
module.exports = router;