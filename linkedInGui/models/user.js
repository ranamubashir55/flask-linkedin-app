
const user = [{
  email: 'admin@admin.com',
  password: 'admin1'
},{
  email: 'admin2@admin.com',
  password: 'admin2'
},{
  email: 'admin3@admin.com',
  password: 'admin3'
},{
  email: 'admin4@admin.com',
  password: 'admin4'
},{
  email: 'admin5@admin.com',
  password: 'admin5'
}];
const findUser =  function (l_user){
  var found_user = null;
  return new Promise((resolve, reject) => {
      for (let i = 0; i < user.length; i++) {
    const c_user = user[i];
    if(c_user.email == l_user.email && c_user.password == l_user.password)
      found_user = c_user;
  }
  if(found_user)
  resolve(found_user);
  else
  reject(null);
  }).catch(err => {});
}
module.exports = {findUser};
