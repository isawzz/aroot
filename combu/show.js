function showError(msg) { 
  mFleet(msg, dError, 2000, 'transparent','red'); 
}
function showSuccessMessage(msg) { mFleet(msg, dError, 2000, 'transparent','blue'); }
function mFleet(msg, d, ms = 2000,bg='inherit',fg='inherit') {
  //if (isdef(bg)) mStyle(d,{bg:bg,fg:fg});
  mCenterFlex(d);
  let d1 = mDiv(d, { w:'80%', bg: bg, fg: fg}, null, msg);
  let a = mAnimate(d1, 'opacity', [1, 0], () => { mRemove(d1); }, ms);
}
function mFleetHoldSpace(msg, d, ms = 2000) { mFleetHold(msg, d, ms, '&nbsp;'); }
function mFleetHold(msg, d, ms = 2000, leave = '&nbsp;') {
  let d1 = mDiv(d, {}, null, msg);
  let a = mAnimate(d1, 'opacity', [1, 0], () => { mRemove(d1); }, ms);
}
function showEssay(dParent, title) {
  mClear(dParent);
  let text = Essays[title];
  let paras = text.split('<br>');
  mDom(dParent, { hpadding: 20 }, { tag: 'h1', html: title });
  //mDiv(dParent,{hpadding:20,box:true},null,`<h1>${title}</h1>`);
  for (const para of paras) {
    mDom(dParent, { hpadding: 20 }, { tag: 'p', html: para });
  }
}
function showQuery(d, verbose = true) {
  if (!verbose) {
    var query = window.location.search.substring(1);
    d.innerHTML = `querystring: ${query}`;
    return;
  }
  let di = queryDict();
  let html = '';
  for (const k in di) html += `${k}=${di[k]}<br>`;
  d.innerHTML = html;
  return;

  //console.log(isdef(undefined));
  //mButton('Welcome!',phpPost)
  //phpStart('index')
  turnOffAutocomplete();
  //mBy('dMain').innerHTML = 'HELLO!!! ' + location.search;
  //window.location.href = `../comm/logout.php`;
}
function showLogin() {
  mClear(dLogin);
  let styles = { w: 90, vpadding: 1, hpadding: 2, margin: 1 }
  let temp = valf(localStorage.getItem('username'),'<username>');
  mInput(dLogin, styles, 'dUser', '<username>', 'plain', null, temp, true);
  mInput(dLogin, styles, 'dPwd', '<password>', 'plain', null, '', true, "password");
  maButton('login', onclickLogin, dLogin, { padding: 1 })

}
function showLoggedin(o) {
  dLogin.innerHTML = `logged in as &nbsp;<b>${o.user.name}</b> &nbsp;&nbsp;`;
  maButton('logout', onclickLogout, dLogin)

}
function showPopupRegister(){
  //console.log('hallo')
  let d=mPopup(null,dMain,{right:0,top:22,wmin:240,bg:'silver'},'dRegister');
  mCenterFlex(d);

  let b = mButtonX(d, ()=>d.remove());
  mPlace(b, 'tr', 10);

  let d1=mDiv(d,{align:'center'},null,`<h1>Registration</h1>`);
  mLinebreak(d)
  //let d2=mDiv(d); mCenterCenterFlex(d2);//,{display:'flex'}); //,{},null,`<h2>Registration</h2>`);
  //mDiv(d,{},null,'&nbsp;<br><br>')
  let form=`
    <form class="" action="javascript:onclickRegister()" autocomplete="off">
    <div>
      <label for="name">Name : </label><br>
      <input type="text" onclick="this.select();" name="name" id = "name" required value=""> <br>
      <label for="username">Username : </label><br>
      <input type="text" onclick="this.select();" name="username" id = "username" required value=""> <br>
      <label for="email">Email : </label><br>
      <input type="email" onclick="this.select();" name="email" id = "email" required value=""> <br>
      <label for="password">Password : </label><br>
      <input type="password" onclick="this.select();" name="password" id = "password" required value=""> <br>
      <label for="confirmpassword">Confirm Password : </label><br>
      <input type="password" onclick="this.select();" name="confirmpassword" id = "confirmpassword" required value=""> <br>
    </div>
    <div style='text-align:center'>
      <button style='width:100%;margin-top:10px;padding:0' class="btn" type="submit" name="submit">Register</button>
    </div>
    </form>
  `;
  let d2=mDiv(d,{padding:25},null,form);

  setTimeout(autofillRegister,2);
}  

function autofillRegister(){
  mBy('name').value='d';
  mBy('username').value='d';
  mBy('email').value='d@gmail.com';
  mBy('password').value='d';
  mBy('confirmpassword').value='d';
}







