const moment = require('moment');

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

module.exports = { execQuery, checkRequestObjectPattern }