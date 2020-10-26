module.exports = models = {

  checkLogin: {
    name:'check login',
    required_fields: ['email'],
    text:`select su.* from sys_users su where email=?`
  }
    

}