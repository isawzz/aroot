function initUI(callback){
  //mStyle('dMain',{box:true,padding:12})
  let dp=mDiv('dMain');
  
  let res = uiRowLayout(dp,'auto auto auto auto 1fr auto');
  let i=0,bg='white';
  dTest=res[i++]; dTest.id='dTest';mFlexLine(dTest,'silver');
  dStatus = res[i++]; dStatus.id='dStatus';mFlexLine(dStatus,'dimgray');
  dError = res[i++]; dError.id = 'dError'; mFlexLine(dError, 'red', 'yellow');
  dHeader=res[i++]; dHeader.id='dHeader';mFlexLine(dHeader,bg);
  dTable=res[i++]; dTable.id='dTable';
  dFooter=res[i++]; dFooter.id='dFooter';mFlexLine(dFooter,'silver');

  res = uiColLayout(dHeader,'auto 1fr auto');
  dLogo = res[0];dLogo.id='dLogo';
  dTitle = res[1];dTitle.id='dTitle';
  dLogin = res[2]; dLogin.id = 'dLogin'; mStyle(dLogin, { display: 'flex', valign: 'center' })

  setTimeout(()=>{
    for(const div of [dTest,dStatus,dError,dFooter,dLogo,dTitle,dLogin]){
      div.innerHTML = '';
    }
    callback();
  },1);
}
