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
        required_fields: ['terminal_id',
            'account',
            'amount',
            'service_id'],
        text: `with pack as (
            insert into public.packages(terminal_id) values($1) RETURNING id  
         )
         insert into public.payments(package_id, service_id, amount) values((select id from pack), $2,$3) RETURNING *`
    }
}