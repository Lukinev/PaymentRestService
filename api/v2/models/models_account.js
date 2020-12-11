module.exports = models = {

  checkLogin: {
    name:'check login',
    required_fields: ['email'],
    text:`select su.* from sys_users su where email = $1`
  },

  insertEmail: {
    name: 'insertEmail',
    required_fields: ['email', 'lat', 'long'],
    text:`insert into sys_users (email, lat, long) values ($1,$2,$3)`
  }

    

}