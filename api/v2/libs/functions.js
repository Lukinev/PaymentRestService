const moment = require('moment'),
model_account = require('../models/models_account');

async function execQuery(model, params, connection) {
    return connection.query(model, params); // returns result of query using pool connect from params "connection"
}

async function checkEmail(email){
    let u = await global.pool_terminal.query(model_account.checkLogin, [email]);
    res = u.rows[0];
    return res;
}

async function insertEmail(email){
    let u = await global.pool_terminal.query(model_account.checkLogin, [email]);
    res = u.rows[0];
    return res;
}


async function getWorkPeriod(){ 
    let u = await global.pool_account.query(model_account.accountWorkPeriod);  
    res = u.rows[0].id;
    return res;
}
async function getWorkPeriodName(){ 
    let u = await global.pool_account.query(model_account.accountWorkPeriod); 
    res = u.rows[0].Name;
    return res;
}

async function getCurrPeriod(){ 
    let u = await global.pool_account.query(model_account.accountCurrPeriod);  
    res = u.rows[0].id;
    return res;
}

async function getAccount(uid, id_provider){ 
    let u = await global.pool_account.query('select name account from ls_shet ls where ls.ls=$1 and ls.kod_org = $2',[uid, id_provider]);  
    res = u.rows[0].account;
    return res;
}
async function getUid(account, id_provider){ 
    let u = await global.pool_account.query('select ls uid from ls_shet ls where ls."name"=$1 and ls.kod_org = $2',[account, id_provider]);  
    if (u.rows.length>0){
        res = u.rows[0].uid;
    }else
    {
        res = 0;
    }
    return res;
}
// func cheked income data by pattern
// incomeParams = {requiredFields:[], request:[]}
async function checkRequestObjectPattern(incomeParams) {
    let res = incomeParams.requiredFields.sort().every(function (value, index) {
        if (value === incomeParams.request.sort()[index])
            return true;
        else
            return false;
    });
    return res;
}
async function checkUID(uid){
    //console.log(uid);
    var res = false;
    try{
    var u = await (execQuery(model_account.accountCheckUID,[uid], global.pool_account));
    //console.log("UID COINT="+u.rows[0].count);
    if (u.rows[0].count!=1){
        res =  false;
    } else{ res =  true;}
    return res;
    } catch(error){
        console.log("ERROR CHECK UID "+error);
        return false;
    }
}

async function checkAmount(amount){
    var res = false;
    if (amount<=0){
        res = false;
    }else{res=true;}
    return res;
}

module.exports = { 
    
    execQuery, 
    checkRequestObjectPattern, 
    checkUID, 
    checkAmount,
    getWorkPeriod,
    getWorkPeriodName,
    getCurrPeriod,
    getAccount,
    getUid,
    checkEmail,
    insertEmail
 }