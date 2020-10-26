const moment = require('moment'),
Router = require('express-promise-router'),
router = new Router(),
models = require('./models/models_account'),
{ checkJWT } = require('./libs/auth'),
async = require('async');
libs = require('./libs/functions');
var request = require('request');

router.get('/account/getBLANK2016/:ls/:code', async (req, res)=> {
    //Сначала ищем эту информацию у себя в базе
    //Сначала получим UID из л/с поставщика
    var kod_org = 39;
    if (Boolean(req.params.code)!=false){
        var kod_org = req.params.code;
    }

    var u = await (libs.execQuery(models.accountGetUID_ORG,[req.params.ls, kod_org], global.pool_account));
    if (Boolean(u.rows[0])){
    const uid = u.rows[0].uid;

    const blank2016_count = await (libs.execQuery(models.accountBlank2016Count,[uid], global.pool_account));
    const row_count = blank2016_count.rows[0].count;
    if(row_count==0){
        //Если нет записей за этим лицевым счетом, запросим данные в ТГО    
        var url = 'http://91.228.59.190:3000/webload/'+req.params.ls+'.0000000000.0';
//        var url = 'http://billing.citypay.org.ua:3000/webload/'+req.params.ls+'.0000000000.0';
        request (url, async (error, response, body)=> {
            if (!error && response.statusCode === 200) {
                var r = await JSON.parse(body)
                row = r['message'][0];
                //выдаем инфо из базы ТГО 
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": row });
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
                return;
                }
        })    
    }else{
        //Если запись найдена выводим информацию из нашей базы
        const bank2016_get = await libs.execQuery(models.accountBlank2016Get,[uid,kod_org],pool_account);
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": bank2016_get.rows });
        return;
    }
}else{
    res.status(400).json({ "status": 400, "error": "Not find Account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    return;
    }

})

router.post('/account/getPeriod', async (req, res) => {
    
    var period_id=await libs.getWorkPeriod();
    var period_name=await libs.getWorkPeriodName();
    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "period_id": period_id, "period_name": period_name });

})
router.post('/account/byAcc', async (req, res) => {
    var provider_id =0;
     //Сначала получим UID из л/с поставщика
    if (Boolean(req.body.provider_id) == false)
    {
        provider_id=39;
    }else {
        provider_id=req.body.provider_id;
    }
    const uid = await libs.getUid(req.body.account, provider_id);
     if ((uid>0)&&(parseInt(uid)==uid)){ 
        //пробуем получить данные с внешнего протокола
        await updateTGO(uid, req.body.account, provider_id);
        //теперь получаем данные по uid
        console.log("byAcc: "+req.body.account);
        const r = await libs.execQuery(models.accountByDATA, [uid], global.pool_account);
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        return;
     }else{
        res.status(400).json({ "status": 400, "error": "Not find UID", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        return;
        }
    });

//Получение данных по UID
router.post('/account/getUID', async (req, res) => {
var uid = req.body.uid;
let provider_id=39;
if (Boolean(req.body.provider_id) == false)
    {
        provider_id=39;
    }else {
        provider_id=req.body.provider_id;
    }

if (uid>0){
    let account =await libs.getAccount(uid,provider_id);    
    console.log("updateTGO from getUID: "+req.body.account+", "+uid+", "+provider_id);
    var t = await updateTGO(uid, account, provider_id);

    const r = await libs.execQuery(models.accountByDATA, [uid], global.pool_account);
    //console.log(uid);
    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
    }
    else
    {
    res.status(400).json({ "status": 400, "error": "Not find UID", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    }
})

//Получение текущего стостояния абонента
//аналог функции дениса getCalc
router.post('/account/getCalc', async (req, res) => {
    let uid=0;
    let provider_id=0;
     //Сначала получим UID из л/с поставщика
     if (Boolean(req.body.provider_id) == false)
     { provider_id=39;}
     else
     { provider_id=req.body.provider_id;}
     uid = await libs.getUid(req.body.account, provider_id);

     async.waterfall([   
        async function StepUpdateTGO(){
            if ((uid>0)&&(parseInt(uid)==uid)){
                //uid = u.rows[0].uid;
                console.log("updateTGO from getCalc: "+req.body.account+", "+uid+", "+provider_id);
                await updateTGO(uid, req.body.account, provider_id);
            } else
                uid=0;
        },
        async function StepResult(){
            if ((uid>0)&&(parseInt(uid)==uid)){ 
                //теперь получаем данные по uid
                const r = await libs.execQuery(models.accountGetCalc, [uid,provider_id], global.pool_account);
            //Синхроним отправленные счета
                const d = await 
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
                return;
            }else
                res.status(400).json({ "status": 400, "error": "Not find UID", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                return;
        }
    ]);
}),

//Поиск абонентов по адрессу
router.post('/account/findAddress', async (req,res)=>{
    if (req.body.street.length > 4){
        street = req.body.street;
        street=street.replace(/[^A-Za-zА-Яа-яЁё ]/g, "");
        street = '%'+street+'%';
        //console.log(street); 
        var u = await (libs.execQuery(models.accountFindAddress,[street,req.body.home, req.body.kv, 39], global.pool_account));
        if (Boolean(u.rows[0])){
            if (u.rows[0].uid>0){ 
                console.log("findAddress: "+u.rows[0].uid);
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
            }else{
                res.status(400).json({ "status": 400, "error": "Not find Abonent", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

        }
        }else{
            res.status(400).json({ "status": 400, "error": "Not find Abonent", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }
    }else{
        res.status(400).json({ "status": 400, "error": "Size of street is small", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    }
}),

router.post('/account/findFIO', async (req, res)=>{
    var provider_id = 39;
    if (Boolean(req.body.provider_id)!=false){
        provider_id = req.body.provider_id;
    }

    if (req.body.fio.length > 5){
        fio = req.body.fio;
        fio=fio.replace(/[^A-Za-zА-Яа-яЁё ]/g, "");
        fio = fio+'%';
        //console.log(fio); 
        var u = await (libs.execQuery(models.accountFinfFIO,[fio, provider_id], global.pool_account));

        if (Boolean(u.rows[0])){
            if (u.rows[0].uid>0){   
                console.log("findFIO "+fio+", "+u.rows[0].uid);

                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
            }else{
                res.status(400).json({ "status": 400, "error": "Not find Abonent", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
            }
        
        }else{
            res.status(400).json({ "status": 400, "error": "Not Find FIO", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }

    }else{
            res.status(400).json({ "status": 400, "error": "Size of FIO is small ", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }

    

}),

router.post('/account/checkLS', async (req,res)=>{
    var provider_id = 39;
//    var datasetFalse = JSON.parse('{"check": false}');
    if (Boolean(req.body.provider_id)!=false){
        provider_id = req.body.provider_id;
    }
    
    var u = await (libs.execQuery(models.accountGetUID_ORG,[req.body.account, provider_id], global.pool_account));
    var dataset = JSON.parse('{"check": '+Boolean(u.rows[0])+'}');
    //console.log(u.rows[0]);
    if (Boolean(u.rows[0])){
        if (u.rows[0].uid>0){ 
            console.log("checkLS "+u.rows[0].uid+", "+req.body.account);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), dataset, "datarow":u.rows});
        }else{
            res.status(400).json({ "status": 400, "error": "Not find account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), dataset});
        }   
    }else{
        res.status(400).json({ "status": 400, "error": "Not find account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), dataset});
    }

}),

router.post('/account/getCounter',async (req,res)=>{
//    var provider_id = 39;
    var uid=0;
    var period_id=await libs.getCurrPeriod(); 

    /*if (Boolean(req.body.provider_id)!=false){
            provider_id = req.body.provider_id;
    }*/

    if (Boolean(req.body.uid)!=false){
        uid = req.body.uid;
    }


    var u = await (libs.execQuery(models.accountGetCounter,[uid, period_id], global.pool_account));
    if (Boolean(u.rows[0])&&(uid>0)){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
    }else{
        
        res.status(400).json({ "status": 400, "error": "Not find counter", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset":null});
    }

}),

router.post('/account/setParamCounter', async(req,res)=>{
    var uid=0;
    var provider_id = 39;
    var account ="0";
    if (Boolean(req.body.uid)!=false){
        uid = req.body.uid;
        
    }
    if (Boolean(req.body.provider_id)!=false){
        provider_id = req.body.provider_id;
    }
    account = await libs.getAccount(uid, provider_id);
    //console.log(account);
    //Сначала удалим запись счетчика в том же периоде у этого абонента по этому счетчику


    var d = await (libs.execQuery(models.accountDelParamCounter,[
            await libs.getCurrPeriod(), 
            uid, 
            req.body.usluga_id,
            req.body.provider_id,
            req.body.placecode
        ], global.pool_account));

    var u = await (libs.execQuery(models.accountSetParamCounter,[
                        await libs.getCurrPeriod(), 
                        uid, 
                        account,
                        req.body.usluga_id,
                        req.body.provider_id, 
                        req.body.placecode, 
                        req.body.date_curr, 
                        req.body.new_val,
                        req.body.notes,
                        req.body.client_id
                    ], global.pool_account));

    if (Boolean(u.rows[0])&&(uid>0)){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
    }else{
    //(id_period, uid, account, placecode, date_prev, start_val, date_curr, new_val, unit, serv, meter_id, link_id, load_id, notes)
    res.status(400).json({ "status": 400, "error": "Not registred values", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset":null});
    }

}),

router.post('/account/getOrganization',async (req,res)=>{
    var city = 16
    if (Boolean(req.body.city)!=false){
        city = req.body.city;
    }
    var u = await (libs.execQuery(models.accountGetOrganization,[city], global.pool_account));
    if (Boolean(u.rows[0])){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
    }else{
        
        res.status(400).json({ "status": 400, "error": "Not find account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset":null});
    }

}),

router.post('/account/getLgot',async (req,res)=>{
    var provider_id = 39;
    var uid=0;
    var period_id = req.body.period_id;
    if (Boolean(req.body.period_id)==false){
        period_id = await libs.getCurrPeriod();
}
    if (Boolean(req.body.provider_id)!=false){
            provider_id = req.body.provider_id;
    }
    if (Boolean(req.body.uid)!=false){
        uid = req.body.uid;
    }

    if (period_id==await libs.getWorkPeriod()){
        period_id=await libs.getCurrPeriod();
    }

    var u = await (libs.execQuery(models.accountGetLgot,[provider_id, period_id, uid], global.pool_account));
    if (Boolean(u.rows[0])&&(uid>0)){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": u.rows });
    }else{
        
        res.status(400).json({ "status": 400, "error": "Not find account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset":null});
    }

})

router.post('/account/updateTGO',async (req,res)=>{
    provider_id = 39;
    account = await libs.getAccount(req.body.uid, provider_id);
    await updateTGO(req.body.uid, account, provider_id);

    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "result":"ok" });
})

async function updateTGO(uid, account, provider_id){
    if (provider_id!=39){
            provider_id = 39; 
    }
    var wrk_period = await libs.getWorkPeriod();
    var url = 'http://91.228.59.190:3000/webload/'+account+'.'+wrk_period+'.6';
//  var url = 'http://billing.citypay.org.ua:3000/webload/'+account+'.'+wrk_period+'.6';
        await request (url, async (error, response, body)=> {
            if (!error && response.statusCode === 200) {
                const fbResponse = await JSON.parse(body)
                const dt = fbResponse['message'][0];
                //Проверяем есть ли такая запись в тса по лс периоду и коду организации
                const i=0;
                const tsa_count = await libs.execQuery(models.accountGetTsaCount,[uid, wrk_period, provider_id], global.pool_account);
                const row_count = await tsa_count.rows[0].count;
                if(row_count===0){
                    //Тогда инсертим данные
                    var today = new Date();
                    var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
                    
                    try{
                    var tsa_insert = await libs.execQuery(models.accountTsaInsert,[    
                                            uid,
                                            moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
                                            dt[i]["PERS"], 
                                            provider_id,
                                            3, //По умолчанию теплоснабжение //usluga
                                            dt[i]["SUM_TRF_HT"], 
                                            dt[i]["SUM_TOPAY_HT"],
                                            dt[i]["SUM_TRF_FW"],
                                            dt[i]["SUM_TOPAY_FW"],
                                            dt[i]["SALDON"],
                                            dt[i]["SUM_TOPAY"],
                                            dt[i]["SUM_PAY_BANK"],
                                            dt[i]["SALDOK"],
                                            dt[i]["SUM_PAY_MPOM"],
                                            dt[i]["SUM_PAY_COMP"], 
                                            dt[i]["SUM_PAY_SUBS"],
                                            wrk_period
                                        ],
                                            
                                            global.pool_account);
                    console.log("INSERT TSA "+uid+" period_id: "+wrk_period);
                    return;
                    }catch(error){
                        console.log("ERROR INSERT DUBLICAT TSA: "+ error);    
                        return;
                    }
                    
                }else{
                    //console.log("UPDATE PERIOD "+dt[i]['PERIOD_ID']);
                    //Обновляем данные в sheta
                    const sheta_update  = await libs.execQuery(models.accountShetaUpdate,
                        [
                            
                            dt[i]['PERS'],//'kp'
                            dt[i]['SQ'],//'pl_o'
                            dt[i]['A_CLOSE'],//a_close
                            dt[i]['A_DEM'],
                            uid //Отбор по  этому значению
                        ]
                        ,global.pool_account);
                    const tsa_update = await libs.execQuery(models.accountTsaUpdate,[
                            dt[i]['PERS'],//kp=$1, +
                            dt[i]['SUM_TOPAY'],//koplate=$2, +
                            dt[i]['SALDON'],//nachisl=$3, +                            0,//norm=$4, 
                            dt[i]['SUM_TOPAY'],//summa_dolg=$4,
                            dt[i]['SUM_TRF_FW'],//tarif=$5, 
                            3, //usluga=$6, 
                            dt[i]['SUM_TRF_HT'], //sum_trf_ht=$7, 
                            dt[i]['SUM_TOPAY_HT'], //sum_topay_ht=$8, 
                            dt[i]['SALDON'],//saldon=$9, 
                            dt[i]['SUM_TOPAY_FW'],//sum_topay_fw=$10, 
                            dt[i]['SUM_PAY_BANK'], //sum_pay_bank=$11, 
                            dt[i]['SUM_PAY_MPOM'],//sum_pay_mpom=$12, 
                            dt[i]['SUM_PAY_COMP'],//sum_pay_comp=$13, 
                            dt[i]['SALDOK'],//saldok=$14,+
                            /////////////////
                            uid, //ls=$15 and 
                            wrk_period//id_period=$16'
                        ]
                        ,global.pool_account);

                    const ls_shet = await libs.execQuery(models.accountLsShetUpdate,[
                            uid,
                            provider_id,
                            3,
                            dt[i]['CIV_NAME']
                        ]
                        ,global.pool_account
                    ) 
                    return;
                }
            } else {
              console.log("Error connect to Oracle: ");
              return;
            } 
    
        });
        

}

//Отправляем показания счетчика в ТГО
async function sendCounterTGO(payid, uid, payidbank, provider_id, placecode,date_prev, start_val, date_curr, new_val, unit, serv, meter_id, link_id, load_id, notes) {
    //получить account из uid
    let acc = await libs.getAccount(uid ,provider_id);

    var src = 0;
    var tgo=0;
    var test = 1; //Тестовый режим = 1
        
    pay_bank_id = payidbank.toString();
    var options = {
        method: 'POST',
//        uri: 'http://85.238.97.144:3000/webload/addCounter',
//        uri: 'http://billing.citypay.org.ua:3000/webload/addCounter',
        uri: 'http://91.228.59.190:3000/webload/addCounter',
        body: {
            "account":acc,
            "provider_id":provider_id,
            "placecode":placecode,  
            "date_prev":date_prev,
            "start_val":start_val,   
            "date_curr":date_curr, 
            "new_val":new_val,
            "rashod":0,
            "unit":unit,      
            "serv":serv,    
            "meter_id":meter_id,    
            "link_id":link_id, 
            "load_id":load_id,     
            "notes":notes
        },
        json: true // Automatically stringifies the body to JSON
    };

    if (test==0){ 
        await rp(options)
        .then(async function (body) {
            var r = await fixPayTGO(payid, body.pay_tgo);
            console.log("sendPayTGO: "+acc);
        })
        .catch(function (err) {
            console.log(err);
            return;
        });
    }else{
        //console.log("TEST BANK NOD LOAD FROM BILLING");
        //const er = await fixPayTGO(payid, -99);
        console.log("Error send counter values: "+tgo+" sources:"+src);
    }    
};



module.exports = router;
