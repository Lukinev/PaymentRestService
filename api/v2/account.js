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

const { Console } = require('console');
//Перечень ссылок используемых в работе
router.post(nameRoute, async(req, res)=>{
  res.status(200).json({"status":200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
  "data":{
    "login":{
      "query":"post",
      "email":"string",
      "password":"string"
      },
      "register":{
        "query":"post",
        "email":"post",
        "password":"string"
      }
  }
});

})

router.post(nameRoute+'login', async (req, res) => {
  try{ 

    //global.
    global.poolFB.get(async function (err, db) {
      db.query(account.checkLogin.text, [req.body.email], async function(error, result) {
          if (error) throw (error);
          // IMPORTANT: release the pool connection
            let h = await result;
            //console.log(h[0].FIO);
            if (Boolean(h[0])) {
              const hash = await h[0].PASSWORD_HASH;

              /*TODO**Необходимо сделать генерацию хешпароля в базу
              let new_hash = bcrypt.hashSync(req.body.password, 256);
              console.log(new_hash);
              */

              let salt = bcrypt.genSaltSync(256);

              let token = await jwt.sign({id:h[0].id}, conf.jwt_params.jwt_secret, {expiresIn:86400});
       
              if (bcrypt.compareSync(req.body.password, hash, salt)){
                  res.status(200).send({result: 200, auth: true, jwt: token, data: h});
              }
              else{
                  res.status(401).send({auth: false, email:req.body.email});
                  console.log('error login by email:', req.body.email);
              }
            } else {
              res.status(400).send({result: 400, auth:false, jwt: null, error: 'Not find records'});
            }

        //return res;
        db.detach(); 
      });
    });
   //poolFB.destroy();

    /*if (Boolean(h.rows[0])){
        let token = await jwt.sign({id:h.rows[0].id}, config.jwt_params.jwt_secret, {expiresIn:86400});
        const hash = await h.rows[0].password;
        let salt = bcrypt.genSaltSync(256);
        //console.log(bcrypt.hashSync(req.body.password, salt));
        if (bcrypt.compareSync(req.body.password, hash, salt)){
            console.log('login by email:', req.body.email);
            res.status(200).send({auth: true, jwt: token , userId: h.rows[0].id, email: h.rows[0].email, firstname: h.rows[0].firstname, lastname: h.rows[0].lastname});
        }else
        {
            res.status(401).send({auth: false, email:req.body.email});
            console.log('error login by email:', req.body.email);

        }

    }else{
        res.status(401).send({auth: false, error: "not find user "+req.body.email});
        console.log('not find user:', req.body.email);
    }*/
    return;
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