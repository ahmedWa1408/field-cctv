document.addEventListener("DOMContentLoaded",function(){

//======================================
// عناصر الصفحة
//======================================

const splashScreen =
document.getElementById("splashScreen");

const welcomeScreen =
document.getElementById("welcomeScreen");

const homePage =
document.getElementById("homePage");

const startSystemBtn =
document.getElementById("startSystemBtn");

const searchCard =
document.getElementById("searchCard");

const routeCard =
document.getElementById("routeCard");

const actionButtons =
document.getElementById("actionButtons");

const searchBtn =
document.getElementById("searchBtn");

const backBtn =
document.getElementById("backBtn");

const missionBtn =
document.getElementById("missionBtn");

const historyBtn =
document.getElementById("historyBtn");

const adminBtn =
document.getElementById("adminBtn");

const settingsBtn =
document.getElementById("settingsBtn");

const planNumber =
document.getElementById("planNumber");

const routeName =
document.getElementById("routeName");//======================================
// شاشة البداية
//======================================

setTimeout(function(){

splashScreen.classList.add("hidden");

welcomeScreen.classList.remove("hidden");

},2000);



//======================================
// دخول النظام
//======================================

startSystemBtn.onclick=function(){

welcomeScreen.classList.add("hidden");

homePage.classList.remove("hidden");

planNumber.focus();

};//======================================
// البحث عن الخطة
//======================================

searchBtn.onclick=function(){

const number=
planNumber.value.trim();

if(number===""){

alert("أدخل رقم الخطة");

planNumber.focus();

return;

}

if(!plans[number]){

alert("رقم الخطة غير موجود");

return;

}

routeName.value=
plans[number].route;

searchCard.classList.add("hidden");

routeCard.classList.remove("hidden");

actionButtons.classList.remove("hidden");

};//======================================
// الرجوع
//======================================

backBtn.onclick=function(){

routeCard.classList.add("hidden");

actionButtons.classList.add("hidden");

searchCard.classList.remove("hidden");

routeName.value="";

planNumber.focus();

};//======================================
// بدء المهمة
//======================================

missionBtn.onclick=function(){

window.location.href=

"mission.html?plan="+

planNumber.value;

};



//======================================
// السجل
//======================================

historyBtn.onclick=function(){

window.location.href=

"history.html";

};



//======================================
// الإدارة
//======================================

adminBtn.onclick=function(){

window.location.href=

"admin.html";

};



//======================================
// الإعدادات
//======================================

settingsBtn.onclick=function(){

window.location.href=

"settings.html";

};



//======================================
// Enter
//======================================

planNumber.addEventListener(

"keydown",

function(e){

if(e.key==="Enter"){

searchBtn.click();

}

}

);

});
