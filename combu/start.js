async function start(){
  initUI();
  initContent(); //(initContent);

  //showPopupRegister();
}
function startLoggedIn(obj){
  console.log('logged in:',obj)
  U = obj.user;
  localStorage.setItem('username',U.username);

  mClear(dTable);
  dTable.innerHTML = `
    <div id="questionnaire"></div>
    <div id="results"></div>
  `;
  displayQuestionnaire();

}
function initContent(){
  //showQuery(dStatus, false);//testing
  
  DA.sessionType=valf(getQuerystring('EP'),'live');
  if (!getQuerystring('id')){
    showEssay(dTable,'The necessity of community');
    showLogin();
  }

  mStyle('dMain',{xover:'hidden'});
}

















