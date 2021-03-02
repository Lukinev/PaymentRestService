module.exports = models = {

  checkEmail: {
    name:'check email',
    required_fields: ['email'],
    text:`select c.* from customer c where c.email = $1`
  },

  insertEmail: {
    name: 'insertEmail',
    required_fields: ['email', 'name'],
    text:`insert into customer (email, name) values ($1, $2) RETURNING id`
  },
}