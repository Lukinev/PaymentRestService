const express = require('express'),
    router = express.Router(),
    conf = require('../../config'),
    checkJWT = require('../../auth');
moment = require('moment');

const { Client } = require('pg');

const conn_param = conf.pg_conn_param;

router.post('/account/byId', function (req, res) {
    checkJWT(req.body).then(r => {
        console.log(r.status);
        if (r.status === 200) {
            if (req.body.account && typeof (req.body.account) === 'number') {
                (async () => {
                    const { rows } = await global.pool.query('SELECT * from tbl where id = $1', [req.body.account])
                    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": rows });
                })().catch(e => {
                    console.log(e.stack);
                    res.status(500).json({ "status": 500, "error": e.stack, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                })
            } else
                res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        } else
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    })
});

//Create
router.post('/account/create', function (req, res) {
    const client = new Client(conn_param);
    client.connect();

    client.query('INSERT INTO tbl(id, name) VALUES($1, $2) RETURNING *', [req.body.id, req.body.name], (err, res_query) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.send(res_query.rows[0]);

        }
    });
});

//Update
router.put('/account/update', function (req, res) {
    const client = new Client(conn_param);
    client.connect();

    client.query('update tbl set name = $1 where id = $2 RETURNING *', [req.body.name, req.body.id], (err, res_query) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.send(res_query.rows[0]);

        }
    });
});

//Delete
router.delete('/account/:id', function (req, res) {
    const client = new Client(conn_param);
    client.connect();

    client.query('delete from tbl where id = $1 RETURNING id', [req.params.id], (err, res_query) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.send(res_query.rows[0]);

        }
    });
});

module.exports = router;
