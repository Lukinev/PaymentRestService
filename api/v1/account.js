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

async function checkAccount(email){
  let _res = 0;
  await libs.checkEmail(email)
  .then(
    async function(res){
    if (Boolean(res)) {
      _res=res.id;
      }else{
        await libs.insertEmail(email).then((result)=>{
        _res = result;  
        return result;
        })
      }
    }).catch((error) => {
          console.err(error);
          _res = -1;
          }
        ) 
 return _res;
}
/**
 * Функция создает токен по email пользователя для доступа к функциям
 * с секретным ключем из conf
*/
router.post(nameRoute+'createToken', async(req, res) => {
  const newtoken = await createJWT(req.body.email);
  if (Boolean(newtoken)) {
  res.status(200).json({
  "status":200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
    "data":{
      "token": newtoken,
      "customer_id": null
    }
    })
  }else{
    res.status(500).send({auth: false, message: 'Failed to create token.' })
  }
  });

  /**
   * Функция проверки токена полученного атоматически 
   */
router.post(nameRoute+'checkToken', async(req, res)=> {
  const token = req.body.token;
  let customer_id = -1;
    await checkJWT(token).then(async function (result) {
      await checkAccount(result.email).then(async function(_customer_id){
        customer_id = _customer_id;
        //console.log(customer_id);
      });
      
      res.status(200).json({"status":result.status, "email": result.email, "customer_id":customer_id});
     }).catch((error) => {
      res.status(400).json({"status":400, "error": error})
      })

    });

router.post(nameRoute+'readGoogleToken', async(req,res) => {
  const token = req.body.token;
})

/**
* Тестовая функция для генерации странички логина Google API
*/
router.get(nameRoute+'loginGoogle', async(req, res) => {
  //Рендерим страничку входа
  res.render("login");
});

/**
 * Тестовая функция обработки токена googla API 
 */
router.post(nameRoute+'loginGoogle', async(req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];

    res.status(200).json({
      "status":200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
      "data": {
          "token":req.body.token,
          "payload":payload
        }
      })
    }
    verify().catch(
      console.error
    );
});


module.exports = router;