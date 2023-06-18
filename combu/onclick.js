function onclickLogin(){

  let [user, pwd] = [mBy('dUser').value, mBy('dPwd').value];

  if (DA.sessionType == 'php')  phpPost({ name: user, pwd: pwd }, 'login');
  else{
    //do some kind of fake login
    handleResult({id:4,email:'a@c',})
  }
}
