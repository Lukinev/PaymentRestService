module.exports = models = {
   
    heatmeterGetId:{
       name: 'hetmeter get id',
       text: `select id from public.heatmeter where sn like $1 or zn like $1` 
       //text: `select id from public.heatmeter where sn like $1` 
   },
   
   heatmeterSetPararams:{
       name: 'heatmeter set params',
       text: `INSERT INTO public.params (client_id, heatmeter_id, power,  flow, energy1, temp1, temp2, manuals, data, times) VALUES ($1, $2, $3, $4, $5, $6, $7,0,$8,$9)`
   },
   
   hetmeterUpdatePower:{
        name: 'heatmeter update power',
        text: `UPDATE public.heatmeter SET last_power=$2, data_power=$3 where id=$1`
            
   },
   heatmeterGetHeatmeterSN:{
       name: 'heatmeter views',
       text: `SELECT * FROM v_meter_heat where sn like $1`
   }

}