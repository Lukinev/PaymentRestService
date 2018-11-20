module.exports = models = {
   
    heatmeterGetId:{
       name: 'hetmeter get id',
       text: `select id from public.heatmeter where sn like $1 or zn like $1` 
   }
   ,
   
   heatmeterSetPararams:{
       name: 'heatmeter set params',
       text: `INSERT INTO public.params (sn, energy1, flow, power, temp1, temp2) VALUES ($1, $2, $4, 0, $5, $6)`
   }
   
  /*
   paymentNewPackage: {
        name: 'create new payment package',
        text: `with pack as (
            insert into public.packages(terminal_id) values($1) RETURNING id  
         )
         insert into public.payments(package_id,service_id,amount) values((select id from pack), 3,$2) RETURNING *`
    }
    */
}

