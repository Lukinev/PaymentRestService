const jwt = require('jsonwebtoken'),
    conf = require('../../../config');


const createJWT = async function (email) {
    //console.log('EMAIL', email)
    const res = await jwt.sign(email, conf.jwt_params.jwt_secret, {algorithm: conf.jwt_params.jwt_option.alg} , {expiresIn: '84000'});
    //console.log('RES', res)
    return res;
}

const checkJWT = async function (token) {
    let result = {};
     jwt.verify(token, conf.jwt_params.jwt_secret,  async function (err, decoded) {
       // console.log(JSON.stringify(decoded.email)+" == "+JSON.stringify(inputParams.email)+" && "+JSON.stringify(decoded.email)+"==="+JSON.stringify(inputParams.email)); 
        if (err) {
            result = { status: 402, error: err };
        }
        else {
                result = { status: 200, email: decoded }
        }
    });
    return result;
}

module.exports = { checkJWT, createJWT };

