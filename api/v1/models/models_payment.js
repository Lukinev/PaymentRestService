module.exports = models = {
    paymentById: {
        name: 'payment by id',
        required_fields:[],
        text: `SELECT p.id, p.amount, p.provider_id, p.service_id, p.created_at, p.payment_attribities
        FROM public.payments p 
        where p.id = $1`
    },
    
    
    paymentNewPackage: {
        name: 'create new payment package',
        required_fields: 
        
        ['terminal_id',
            'account',
            'amount',
            'period_id',
            'service_id',
            'data_pay',
            'provider_id',
            'client_id',
            'client_name',
            'token'
        ],

        text: `with pack as (
            insert into public.packages(client_id) values($1) RETURNING id  
         )
         insert into public.payments(package_id, service_id, amount, provider_id) values((select id from pack), $2,$3,$4) RETURNING *`
    },

     paymentNewPay:{
        name: 'create new payment',
        required_fields: [
            "uid",
            "amount",
            "service_id",
            "provider_id",
            "client_id",
            "createpay",
        ],
        
        text:`insert into public.payments(uid, amount, service_id, provider_id, createpay, client_id) values ($1,$2,$3,$4,$5,$6) returning id, amount, created_at`
     }
}