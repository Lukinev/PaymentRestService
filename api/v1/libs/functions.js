const moment = require('moment'),
model_account = require('../models/models_account');

async function execQuery(model, params, connection) {
    return connection.query(model, params); // returns result of query using pool connect from params "connection"
}

async function checkEmail(email){
    let u = await global.pool_accounts.query(model_account.checkEmail, [email]);
    res = u.rows[0];
    return res;
}

async function insertEmail(email){
    let u = await global.pool_accounts.query(model_account.insertEmail, [email]);
    res = u.rows[0];
    return res;
}

module.exports = { 
    execQuery,
    checkEmail,
    insertEmail
 }