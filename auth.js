const jwt = require('jsonwebtoken'),
    conf = require('./config');

const checkJWT = async function (inputParams) {
    let res = {};
    jwt.verify(inputParams.user_token, conf.jwt_params.jwt_secret, conf.jwt_params.jwt_option, function (err, decoded) {
        if (err) {
            res = { status: 400 };
        }
        else {
            if (JSON.stringify(decoded.client_name) == JSON.stringify(inputParams.client_name) && JSON.stringify(decoded.client_id) === JSON.stringify(inputParams.client_id)) {
                res = { status: 200 }
            }
            else res = { status: 400 }
        }
    });
    return res;
}
/*const createJWT = function (params) {
    const payload = {
        name: inputParams.nameClient,
        idClient: inputParams.idClient
    };
    const createToken = jwt.sign(payload, conf.jwt_params.jwt_secret, {
        // expiresIn: "365d" // expires in 1 year
    },
        conf.jwt_params.jwt_option);
    console.log(createToken);
    return { "status": 200, "error": null, "userToken": createToken };

}*/
module.exports = checkJWT;

