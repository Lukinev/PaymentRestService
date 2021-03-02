const moment = require('moment'),
Router = require('express-promise-router'),
router = new Router(),
jwt = require('jsonwebtoken'),
account = require('./models/models_account'),
async = require('async'),
libs = require('./libs/functions'),
{ checkJWT, createJWT } = require('./libs/auth'),
request = require('request'),
conf = require('../../config'),
nameRoute = '/account/';


//GOOGLE AUTH
const CLIENT_ID =conf.GOOGLE_CLIENT_ID;  // Specify the CLIENT_ID of the app that accesses the backend
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**Функция проверки пользователя в базе данных
 * @param email - емаил пользователя
 * @param name - имя пользователя из токена
 * @returns - возвражает id пользователя в базе данных, в случае отсутствия пользователя - создает
 */
async function checkAccount(_email, _name=''){
  let _res = 0;
  await libs.checkEmail(_email)
  .then(async (result_email)=>{
      if (Boolean(result_email)) {
      _res=result_email.id;
      }else{
        if (Boolean(_email)){
          await libs.insertEmail(_email, _name).then((result)=>{
          _res = result.id;  
          return _res;
        })
        }
      }
    })

  .catch((error) => {
          console.log(error);
          _res = null;
          }
        ) 
 return _res;
}
/**
 * Функция создает токен по email пользователя для доступа к функциям
 * с секретным ключем из conf
*/
router.post(nameRoute+'createToken', async(req, res) => {
  let _customer_id = null;
  const data = {
    "email": req.body.email, 
    "name": req.body.name
  } ;

  const newtoken = await createJWT(data);


  if (Boolean(newtoken)) {
    await checkAccount(data.email, data.name).then(async(cust)=>_customer_id=cust).catch(()=> _customer_id=null);
    
    res.status(200).json({
    "status":200, "error": null,//.format('DD.MM.YYYY hh:mm:ss.SSS'),
    "data":{
      "token": newtoken,
      "name": req.body.name
    }
    })
  }else{
    res.status(500).send({status: 500, error: 'Failed to create token.' })
  }
  });

  /**
   * Функция проверки токена полученного атоматически 
   */
router.post(nameRoute+'checkToken', async(req, res)=> {
  const token = req.body.token;
  let customer_id = null;
    await checkJWT(token).then(async function (result) {
  
        await checkAccount(result.email, result.name).then(async function(_customer_id){  
        customer_id = _customer_id; });
        
      res.status(200).json({"status":result.status, "email": result.email, "customer_id":customer_id});
     }).catch((error) => {
      res.status(400).json({"status":400, "error": error})
      })

    });


/**
* Тестовая функция для генерации странички логина Google API
*/
router.get(nameRoute+'loginGoogle', async(req, res) => {
  //Рендерим страничку входа
  res.render("login");
});

/**
 * Функция обработки токена googla API 
 */
router.post(nameRoute+'loginGoogle', async(req, res) => {
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: req.body.token,
        audience: CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const userid = payload['sub'];

   
    if (Boolean(payload.email)){
    //Генерим токен для доступа
      const newtoken = await createJWT({"email":payload.email, "namep":payload.name});   
      if (Boolean(newtoken)) {
        await checkAccount(payload.email, payload.name);

        res.status(200).json({
        "status":200, "error": null,
        "data":{
          "token": newtoken,
          "name": payload.name
        }
        })
      }
    }
  }

    verify().catch( async (error) =>{
      res.status(500).json({"status": 500, "error": error.message})},

    );
});


module.exports = router;