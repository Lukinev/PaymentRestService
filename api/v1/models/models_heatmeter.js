module.exports = models = {
    paymentById: {
        name: 'heatmeter by id',
        text: `SELECT h.id, p.amount, p.provider_id, p.service_id, p.payment_timestamp, p.createdat, p.account_id
        FROM public.payments p 
        where p.id = $1`
    },
    paymentNewPackage: {
        name: 'create new payment package',
        text: `with pack as (
            insert into public.packages(terminal_id) values($1) RETURNING id  
         )
         insert into public.payments(package_id,service_id,amount) values((select id from pack), 3,$2) RETURNING *`
    }
}