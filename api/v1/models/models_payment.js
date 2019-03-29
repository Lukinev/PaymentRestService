module.exports = models = {
    paymentGetBankTGO:{
        name: 'account get bank tgo',
        text:'select id_tgo, test from bank where id=$1'
},
    
    paymentById: {
        name: 'payment by id',
        required_fields:['payment_id'],
        text: `SELECT p.id, 
		        p.amount, 
		        p.provider_id, 
                p.service_id, 
                p.created_at,
                p.createpay,
                p.client_id,
                p.uid,
                p.storno_id,
                p.pay_id_bank,
                p.pay_id_tgo
            FROM public.payments p 
                where p.id = $1 and client_id=$2`
    },

    paymentGetPayIdBank: {
        name: 'payment get pay_id_bank',
        required_fields:['pay_id_bank'],
        text: `SELECT p.id, 
		        p.amount, 
		        p.provider_id, 
                p.service_id, 
                p.created_at,
                p.createpay,
                p.client_id,
                p.uid,
                p.storno_id,
                p.pay_id_bank
            FROM public.payments p 
                where p.pay_id_bank = $1 and client_id=$2`
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
        
        text:`insert into public.payments(uid, amount, service_id, provider_id, createpay, client_id, pay_id_bank) values ($1,$2,$3,$4,$5,$6,$7) returning id, amount, created_at`
     },



     paymentNewStorno:{
         name: 'create storno',
         text: `insert into storno (data, summa, tip, id_pay )values($1, $2, $3, $4) RETURNING id`

     },

     paymentCheckStorno:{
        name:'check strono',
        text: 'select count(*) from storno where id_pay=$1'          
     },
     

     paymentSetStornoPay:{
         name:'set storno pay',
         text: 'update payments SET storno_id=$1 where id=$2'
     },

     paymentGetNotSendPay:{
         name:'get not send pay',
         text:`select * from payments p
                where
                p.storno_id=0
                and
                p.pay_id_tgo=0
                and
                p.pay_id_bank>0`
     },

     paymentSetPayTGO:{
        name:'set pay tgo',
        text: 'update payments SET pay_id_tgo=$2 where id=$1'
    },
}