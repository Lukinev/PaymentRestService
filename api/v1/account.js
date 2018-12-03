const moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');
    var request = require('request');

router.get('/account/getBLANK2016/:ls', async (req, res)=> {
    //res.send('user' + req.params.ls);    
    //console.log(req.params.ls);
    var url = 'http://85.238.97.144:3000/webload/'+req.params.ls+'.0000000000.0';
    //Сначала получим UID из л/с поставщика
    request (url, async (error, response, body)=> {
        if (!error && response.statusCode === 200) {
           var r = JSON.parse(body)
           r = r['message'][0];
           
           res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r });
        } else {
          //  console.log("Error connect to central DB: ", error, ", status code: ", response.statusCode)
            res.status(400).json({ "status": 400, "error": "Error connect central DB", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }
    })    
})

router.post('/account/byAcc', async (req, res) => {
        //const checkRequiredFields = await libs.checkRequestObjectPattern({ requiredFields: models.accountById.required_fields, request: Object.keys(req.body) });     
        var url = 'http://85.238.97.144:3000/webload/'+req.body.account+'.0000000000.1';
        //Сначала получим UID из л/с поставщика
        const u = await libs.execQuery(models.accountGetUID,[req.body.account,req.body.kod_org], global.pool_account);
        //console.log(u.rows);
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
                    const tsa_insert = await libs.execQuery(models.accountTsaInsert,[
                            uid, //ls
                            dt[i]['REG_DATE'], //dt 
                            dt[i]['CIV_CODE'], //ls_poluch
                            dt[i]['PERS'], //kp
                            req.body.kod_org, //kod_poluch
                            3, //По умолчанию теплоснабжение //usluga
                            dt[i]['SUM_TOPAY'], //suma_dolg
                            dt[i]['SALDOK'],//nachisl
                            dt[i]['SUM_TRF_FW'], //tarif
                            dt[i]['SUM_PAY_SUBS'], //subsid
                            dt[i]['PERIOD_ID'],//id_period
                            //------------------------------------------------------
                            dt[i]['A_CLOSE'],//..
                            dt[i]['A_DEM'],
                            dt[i]['SUM_TRF_HT'],
                            dt[i]['SUM_TOPAY_HT'],
                            dt[i]['SALDON'],
                            dt[i]['SUM_TOPAY_FW'],
                            dt[i]['SUM_PAY_BANK'],                            
                            dt[i]['SUM_PAY_MPOM'],
                            dt[i]['SUM_PAY_COMP'],
                            dt[i]['SALDOK']
                            ],
                        global.pool_account);

                    //console.log(tsa_insert);
                   /* 

                    
                    console.log("A_ACT_HW: "+dt[i]['A_ACT_HW']) 
                    console.log("A_METR_HW: "+dt[i]['A_METR_HW']) 
                    console.log("A_ACT_HT: "+dt[i]['A_ACT_HT']) 
                    console.log("A_METR_HT: "+dt[i]['A_METR_HT']) 
                    console.log("METER_ID: "+dt[i]['METER_ID']) 
                    console.log("PRIV_CNT: "+dt[i]['PRIV_CNT']) 
                    console.log("A_PRIV: "+dt[i]['A_PRIV']) 
                    console.log("A_INDB: "+dt[i]['A_INDB']) 
                    console.log("");*/
                }else
                {
                    //Обновляем данные в sheta
                    const sheta_update  = libs.execQuery(models.accountShetaUpdate,
                        [
                            dt[i]['CIV_NAME'], //'fio'
                            0,//'k_lgot'
                            dt[i]['PERS'],//'kp'
                            0,//'kp_jek'
                            dt[i]['SQ'],//'pl_o'
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
                                dt[i]['A_CLOSE'], //a_close=$10, 
                                dt[i]['A_DEM'], //a_dem=$11,
                                dt[i]['SUM_TRF_HT'], //sum_trf_ht=$12, 
                                dt[i]['SUM_TOPAY_HT'], //sum_topay_ht=$13, 
                                dt[i]['SALDON'],//saldon=$14, 
                                dt[i]['SUM_TOPAY_FW'],//sum_topay_fw=$15, 
                                dt[i]['SUM_PAY_BANK'], //sum_pay_bank=$16, 
                                dt[i]['SUM_PAY_MPOM'],//sum_pay_mpom=$17, 
                                dt[i]['SUM_PAY_COMP'],//sum_pay_comp=$18, 
                                dt[i]['SALDOK'],//saldok=$19,
                                /////////////////
                                uid, //ls=$20 and 
                                dt[i]['PERIOD_ID']//id_period=$21'
                                //kp=$1, koplate=$2, nachisl=$3, norm=$4, proc_lgo=$5, procent_lg=$6, summa_dolg=$7, '+
					//'tarif=$8, usluga=$9, a_close=$10, a_dem=$11, sum_trf_ht=$12, sum_topay_ht=$13, saldon=$14, sum_topay_fw=$15, '+ 
					//'sum_pay_bank=$16, sum_pay_mpom=$17, sum_pay_comp=$18, saldok=$19'+
				//'where ls=$20 and id_period=$21'

                        ]
                        ,global.pool_account);
                    //console.log('Update data from period: '+dt[i]['PERIOD_ID']+'('+tsa_count+')')
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



module.exports = router;
