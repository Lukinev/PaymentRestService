module.exports = models = {

  checkEmail: {
    name:'check email',
    required_fields: ['email'],
    text:`select su.* from sys_users su where su.email = $1`
  },

  insertEmail: {
    name: 'insertEmail',
    required_fields: ['email', 'lat', 'long'],
    text:`insert into sys_users (email, lat, long) values ($1,$2,$3)`
  },


  checkLogin: {
    name:'check login',
    required_fields: ['email, password'],
    text:`select su.* from sys_users su where su.email = $1 and su.password=$2 `
  },


    

}