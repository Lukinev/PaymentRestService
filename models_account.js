module.exports = models = {
    accountById: {
        name: 'account debt by id',
        text: `select * from sheta as acc 
join street as st on st.np = acc.street_nom
join tip_street as tst on tst.np = st.tip
where acc.ls = $1`
    }
}

