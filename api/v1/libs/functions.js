const moment = require('moment');

function execQuery(model, params, res, connection) {
    (async () => {
        const { rows } = await connection.query(model, params)
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": rows });
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({ "status": 500, "error": e.stack, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    })
}

async function insertQuery(model, params, connection) {
    const { rows } = await connection.query(model, params);
    return rows;
    //console.log(res.rows[0])
    // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }



}

module.exports = { execQuery, insertQuery }