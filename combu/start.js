async function start(){
  initUI(initContent);
}
function startLoggedIn(obj){
  console.log('logged in:',obj)
}
function initContent(){
  showQuery(dStatus,false);
  
  DA.sessionType=valf(getQuerystring('EP'),'live');
  if (!getQuerystring('id')){
    showEssay(dTable,'The necessity of community');
    mInput(dLogin,{},'dUser','user');
    mInput(dLogin,{},'dPwd','password');
    mButton('login',onclickLogin,dLogin)
  }

  mStyle('dMain',{xover:'hidden'});
}

















