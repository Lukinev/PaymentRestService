module.exports = models = {
    paymentById: {
        name: 'payment by id',
        text: ``
    },
    paymentNewPackage: {
        name: 'create new payment package',
        text: `insert into public.packages(terminal_id) values($1) RETURNING *`
    },
    paymentNew: {
        name: 'create new payment',
        text: `insert into payments(package_id,service_id) values($1,1) RETURNING *`
    }
}