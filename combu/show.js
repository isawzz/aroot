function showError(msg){
  let d=mDom(dError,{},{html:msg});
  setTimeout(()=>mFade(d),3000);
}