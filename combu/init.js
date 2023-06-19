function initUI(){
  //mStyle('dMain',{box:true,padding:12})
  dMain=mDiv('dMain');
  
  let res = uiRowLayout(dMain,'auto auto auto auto 1fr auto');
  let i=0,bgtop='#eee',bg='#ddd';
  //dTest=res[i++]; dTest.id='dTest';mFlexLine(dTest,bgtop);
  //dStatus = res[i++]; dStatus.id='dStatus';mFlexLine(dStatus,'dimgray');
  dHeader=res[i++]; dHeader.id='dHeader';mFlexLine(dHeader,bgtop);
  dError = res[i++]; dError.id = 'dError'; mFlexLine(dError, bgtop); mCenterFlex(dError);//, 'yellow');
  dTable=res[i++]; dTable.id='dTable';mStyle(dTable,{bg:bg});
  dFooter=res[i++]; dFooter.id='dFooter';mFlexLine(dFooter,bgtop);

  res = uiColLayout(dHeader,'auto 1fr auto');
  dLogo = res[0];dLogo.id='dLogo';
  dTitle = res[1];dTitle.id='dTitle';
  dLogin = res[2]; dLogin.id = 'dLogin';
  mFlexLine(dLogin,bgtop); mStyle(dLogin,{h:22});//mStyle(dLogin, { display: 'flex', valign: 'center' })

  //callback();
  // setTimeout(()=>{
  //   for(const div of [dTest,dStatus,dError,dFooter,dLogo,dTitle,dLogin]){
  //     div.innerHTML = '';
  //   }
  //   callback();
  // },1);
}
