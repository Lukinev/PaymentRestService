const moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');
    var request = require('request');

router.get('/account/getBLANK2016/:ls', async (req, res)=> {
    //Сначала ищем эту информацию у себя в базе
    //Сначала получим UID из л/с поставщика
    var u = await (libs.execQuery(models.accountGetUID,[req.params.ls,39], global.pool_account));
    const uid = u.rows[0].ls;

    const blank2016_count = await (libs.execQuery(models.accountBlank2016Count,[uid], global.pool_account));
    //console.log(blank2016_count.rows[0].count);
    const row_count = blank2016_count.rows[0].count;
    if(row_count==0){
        //Если нет записей за этим лицевым счетом, запросим данные в ТГО    
        var url = 'http://85.238.97.144:3000/webload/'+req.params.ls+'.0000000000.0';
        request (url, async (error, response, body)=> {
            if (!error && response.statusCode === 200) {
                var r = JSON.parse(body)
                r = r['message'][0];
                //выдаем инфо из базы ТГО 
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r });
                //и обновляем информацию в нашей базе 
                const blank2016_insert = await libs.execQuery(models.accountBlank2016Insert,[
                    uid,
                    parseFloat(r[0]['SQ']), 
                    r[0]['ADDR_ID'], 
                    parseFloat(r[0]['SQ_DOM']), 
                    r[0]['PERS'], 
                    r[0]['A_STATE'], 
                    r[0]['A_ACT_HW'], 
                    r[0]['A_ACT_HT'], 
                    r[0]['A_METR_HW'],
                    r[0]['A_METR_HT'], 
                    r[0]['A_METR_HOUSE_HW'], 
                    r[0]['A_METR_HOUSE_HT'], 
                    r[0]['DATE_CHECK_HW'], 
                    r[0]['DATE_CHECK_HT'], 
                    r[0]['DATA_METR_HW'], 
                    r[0]['DATA_NORM_HW'], 
                    parseFloat(r[0]['GKAL_1_2']), 
                    parseFloat(r[0]['GKAL_3_4']), 
                    parseFloat(r[0]['GKAL_5']), 
                    r[0]['GKAL_DOM'], 
                    r[0]['GKALM_DOM'], 
                    parseFloat(r[0]['DT_HW_DOM']), 
                    parseFloat(r[0]['SUM_HT_DOM']), 
                    parseFloat(r[0]['SUM_HW_DOM'])
                    ],global.pool_account);

                } else {
                //Если доступа к базе ТГО нет, то брать информацию с  сервера
                res.status(400).json({ "status": 400, "error": "Error connect central DB", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                }
        })    
    }else{
        //Если запись найдена выводим информацию из нашей базы
        const bank2016_get = await libs.execQuery(models.accountBlank2016Get,[uid,39],pool_account);
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": bank2016_get.rows });
    }
})

router.post('/account/byAcc', async (req, res) => {
        var url = 'http://85.238.97.144:3000/webload/'+req.body.account+'.0000000000.5';
        //Сначала получим UID из л/с поставщика
        const u = await libs.execQuery(models.accountGetUID,[req.body.account,req.body.kod_org], global.pool_account);
        const uid = u.rows[0].ls;
        //пробуем получить данные с внешнего протокола
        request (url, async (error, response, body)=> {
            if (!error && response.statusCode === 200) {
              const fbResponse = JSON.parse(body)
              const dt = fbResponse['message'][0];
              for(var i=0; i<dt.length; i++) {
                //Проверяем есть ли такая запись в тса по лс периоду и коду организации
                const tsa_count = await libs.execQuery(models.accountGetTsaCount,[req.body.account,dt[i]['PERIOD_ID'],req.body.kod_org], global.pool_account);
                const row_count = tsa_count.rows[0].count;
                if(row_count==0){
                //Тогда инсертим данные
                var today = new Date();
                var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
                const tsa_insert = await libs.execQuery(models.accountTsaInsert,[
                            uid, //ls
                            today.toLocaleDateString('ukl', options), //dt 
                            dt[i]['CIV_CODE'], //ls_poluch
                            dt[i]['PERS'], //kp
                            req.body.kod_org, //kod_poluch
                            3, //По умолчанию теплоснабжение //usluga
                            dt[i]['SUM_TOPAY'], //suma_dolg
                            dt[i]['SALDOK'],//nachisl
                            dt[i]['SUM_TRF_HT'], //tarif
                            dt[i]['SUM_PAY_SUBS'], //subsid
                            dt[i]['PERIOD_ID'],//id_period
                            dt[i]['SUM_TRF_FW'],
                            dt[i]['SUM_TOPAY_HT'],
                            dt[i]['SALDON'],
                            dt[i]['SUM_TOPAY_FW'],
                            dt[i]['SUM_PAY_BANK'],                            
                            dt[i]['SUM_PAY_MPOM'],
                            dt[i]['SUM_PAY_COMP'],
                            dt[i]['SALDOK']
                            ],
                        global.pool_account);
                }else
                {//Обновляем данные в sheta
                    const sheta_update  = libs.execQuery(models.accountShetaUpdate,
                        [
                            dt[i]['CIV_NAME'], //'fio'
                            0,//'k_lgot'
                            dt[i]['PERS'],//'kp'
                            0,//'kp_jek'
                            dt[i]['SQ'],//'pl_o'
                            dt[i]['A_CLOSE'],//a_close
                            dt[i]['A_DEM'],
                            uid //Отбор по  этому значению
                        ],global.pool_account);
                    const tsa_update = libs.execQuery(models.accountTsaUpdate,[
                                dt[i]['PERS'],//kp=$1, 
                                dt[i]['SUM_TOPAY'],//koplate=$2, 
                                dt[i]['SALDOK'],//nachisl=$3, 
                                0,//norm=$4, 
                                0,//proc_lgo=$5, 
                                0,//procent_lg=$6, 
                                dt[i]['SUM_TOPAY'],//summa_dolg=$7,
                                dt[i]['SUM_TRF_FW'],//tarif=$8, 
                                3, //usluga=$9, 
                                dt[i]['SUM_TRF_HT'], //sum_trf_ht=$10, 
                                dt[i]['SUM_TOPAY_HT'], //sum_topay_ht=$11, 
                                dt[i]['SALDON'],//saldon=$12, 
                                dt[i]['SUM_TOPAY_FW'],//sum_topay_fw=$13, 
                                dt[i]['SUM_PAY_BANK'], //sum_pay_bank=$14, 
                                dt[i]['SUM_PAY_MPOM'],//sum_pay_mpom=$15, 
                                dt[i]['SUM_PAY_COMP'],//sum_pay_comp=$16, 
                                dt[i]['SALDOK'],//saldok=$17,
                                /////////////////
                                uid, //ls=$18 and 
                                dt[i]['PERIOD_ID']//id_period=$19'
                        ]
                        ,global.pool_account);
                }

            }
            } else {
              console.log("Error connect to Oracle: ", error, ", status code: ", response.statusCode)
            }
            
        });

        if (u.rows[0].ls>0){ 
            //теперь получаем данные по uid
            const r = await libs.execQuery(models.accountById, [uid], global.pool_account);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        }else
            res.status(400).json({ "status": 400, "error": "Not find UID", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

//Получение текущего стостояния абонента
//аналог функции дениса getCalc
router.post('/account/getCalc', async (req, res) => {

}),

//Поиск абонентов по адрессу
router.post('/account/findAddress', async (req,res)=>{
    if (req.body.street.length > 4){
        street = req.body.street;
        street=street.replace(/[^A-Za-zА-Яа-яЁё ]/g, "");
        street = '%'+street+'%';
        console.log(street); 
        var u = await (libs.execQuery(models.accountFindAddress,[street,req.body.home, req.body.kv, 39], global.pool_account));
        if (u.rows[0].uid>0){ 
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
        }else{
            res.status(400).json({ "status": 400, "error": "Not find Abonent", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

        }
    }else{
        res.status(400).json({ "status": 400, "error": "Size of street is small", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

    }
}),

router.post('/account/findFIO', async (req, res)=>{
    if (req.body.fio.length > 5){
        fio = req.body.fio;
        fio=fio.replace(/[^A-Za-zА-Яа-яЁё ]/g, "");
        fio = fio+'%';
        console.log(fio); 
        var u = await (libs.execQuery(models.accountFinfFIO,[fio, 39], global.pool_account));
        if (u.rows[0].uid>0){ 
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
        }else{
            res.status(400).json({ "status": 400, "error": "Not find Abonent", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

        }
    }else{
        res.status(400).json({ "status": 400, "error": "Size of FIO is small", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

    }

}),

function updateTSA(){

}


module.exports = router;
