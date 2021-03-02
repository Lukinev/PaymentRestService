const moment = require('moment'),
model_account = require('../models/models_account');
const conf = require('./../../../config');
const { Pool } = require('postgres-pool');

const pool = new Pool(conf.pg_pool_conn_param_accounts);


async function checkEmail(email){
    let u = null; 
    await pool.connect()
     .then(client => {
         return client      
        .query(model_account.checkEmail, [email])
       .then(res => {
         client.release()
         u = res.rows[0]; 
         
      })
     .catch(err => {
         client.release()
         console.log(err.stack)
         u = null;
       })
   })

    return u;
}

async function insertEmail(email, name){
    let u = null;
    await pool.connect()
     .then(client => {
         return client      
        .query(model_account.insertEmail, [email, name])
        .then(res => {
         client.release()
         u = res.rows[0];  
      })
     .catch(err => {
         client.release()
         console.log(err.stack)
         u = null;
       })
   })
    return u;
}

module.exports = { 
    checkEmail,
    insertEmail
 }