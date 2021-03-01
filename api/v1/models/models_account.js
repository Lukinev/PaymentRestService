module.exports = models = {

  checkEmail: {
    name:'check email',
    required_fields: ['email'],
    text:`select c.* from customer c where c.email = $1`
  },

  insertEmail: {
    name: 'insertEmail',
    required_fields: ['email'],
    text:`insert into customer (email) values ($1) RETURNING id`
  },
}