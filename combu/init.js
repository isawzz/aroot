function initUI(){
  //mStyle('dMain',{box:true,padding:12})
  let dp=mDiv('dMain');
  [dTest,dTop,dHeader,dTable,dFooter]=rowLayout(dp,'auto auto auto 1fr auto');
  dStatus=mDom(dTop,{},{html:'status'});
  dError=mDom(dTop,{fg:'yellow',bg:'red'});
  //mPos(dError,10,0)
  [dLogo,dTitle,dLogin]=colLayout(dHeader,'auto 1fr auto');

}