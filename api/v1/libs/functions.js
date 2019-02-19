const moment = require('moment'),
        model_account = require('../models/models_account');


async function execQuery(model, params, connection) {

    return connection.query(model, params); // returns result of query using pool connect from params "connection"
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

module.exports = { execQuery, checkRequestObjectPattern, checkUID, checkAmount}