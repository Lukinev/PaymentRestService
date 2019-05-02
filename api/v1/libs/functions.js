const moment = require('moment'),
model_account = require('../models/models_account');

async function execQuery(model, params, connection) {
    return connection.query(model, params); // returns result of query using pool connect from params "connection"
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
    res = u.rows[0].uid;
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
    var u = await (execQuery(model_account.accountCheckUID,[uid], global.pool_account));
    //console.log("UID COINT="+u.rows[0].count);
    if (u.rows[0].count!=1){
        res =  false;
    } else{ res =  true;}
    return res;

}

async function checkAmount(amount){
    var res = false;
    if (amount<=0){
        res = false;
    }else{res=true;}
    return res;
}

async function checkPAY(body){
    var res = false;
    var err= "Error ";
    var uid = await checkUID(body.uid);
    var amount = await checkAmount(body.amount);
    
    if (uid==false){
        err += " Not find uid "+body.uid+"\n";
    }
    if (amount==false){
        err += " Check ammoun "+body.amount+"\n";   
    }
    if (uid && amount){
        res = true;
    } 
    
    console.log("Error="+err);
    return {res : res, err : err};
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
    getUid
 }