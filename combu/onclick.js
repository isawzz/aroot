function onclickLogin(){

  let [user, pwd] = [mBy('dUser').value, mBy('dPwd').value];

  if (DA.sessionType == 'php')  phpPost({ name: user, pwd: pwd }, 'login');
  else{
    //do some kind of fake login
    handleResult(JSON.stringify({
      id:4,
      status:'not_registered',
      user: { email: "a@gmail.com", id: "4", name: "a", password: "a", username: "a" }
    }),'login')
  }
}
function onclickLogout(){
  //console.log('hallo')
  if (DA.sessionType == 'php')  phpPost({}, 'logout');
  else{
    //do some kind of fake login
    handleResult("",'logout')
  }
}
function onclickRegister(){
  //console.log('hallo');
  let o={
    name:mBy('name').value,
    username:mBy('username').value,
    email:mBy('email').value,
    password:mBy('password').value,
    confirmpassword:mBy('confirmpassword').value
  };
  if (DA.sessionType == 'php')  phpPost(o, 'register');
  else{
    //do some kind of fake login
    o.status = 'registered'
    handleResult(JSON.stringify(o),'register')
  }
  

}























