const jwt = require('jsonwebtoken'),
    conf = require('../../../config');

const checkJWT = async function (inputParams) {
    let res = {};
    jwt.verify(inputParams.user_token, conf.jwt_params.jwt_secret, conf.jwt_params.jwt_option, function (err, decoded) {
        //console.log(JSON.stringify(decoded.client_name)+" == "+JSON.stringify(inputParams.client_name)+" && "+JSON.stringify(decoded.client_id)+"==="+JSON.stringify(inputParams.client_id)); 
        if (err) {
            res = { status: 402 };
        }
        else {
            //console.log(JSON.stringify(decoded.client_name)+" == "+JSON.stringify(inputParams.client_name)+" && "+JSON.stringify(decoded.client_id)+"==="+JSON.stringify(inputParams.client_id)); 
            if (JSON.stringify(decoded.client_name) == JSON.stringify(inputParams.client_name) && JSON.stringify(decoded.client_id) === JSON.stringify(inputParams.client_id)) {
                res = { status: 200 }
            }
            else {
                res = { status: 401 }
            }
        }
    });
    return res;
}

module.exports = { checkJWT };

