const jwt = require('jsonwebtoken'),
    conf = require('../../../config');


const createJWT = async function (data) {
    
    const res = await jwt.sign(data, conf.jwt_params.jwt_secret, {algorithm: conf.jwt_params.jwt_option.alg} , {expiresIn: '84000'});
    return res;
}

const checkJWT = async function (token) {
    let result = {};
    console.log('Start checkJWT');
     jwt.verify(token, conf.jwt_params.jwt_secret,  async function (err, decoded) {
        if (err) {
            result = { status: 402, error: err };
        }
        else {
            result = { status: 200, email: decoded.email, name: decoded.name, iat: decoded.iat }
        }
    });
    return result;
}

module.exports = { checkJWT, createJWT };

