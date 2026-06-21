window.onload = function () {

    // إظهار الشعار لمدة ثانيتين
    setTimeout(function () {

        document.getElementById("splashScreen").classList.add("hidden");
        document.getElementById("welcomeScreen").classList.remove("hidden");

        // بعد 3 ثوانٍ تظهر الصفحة الرئيسية تلقائياً
        setTimeout(function () {

            document.getElementById("welcomeScreen").classList.add("hidden");
            document.getElementById("homePage").classList.remove("hidden");

        },3000);

    },2000);

};


// البحث عن الخطة

document.getElementById("searchBtn").onclick=function(){

    let number=document.getElementById("planNumber").value.trim();

    if(number===""){

        alert("أدخل رقم الخطة");

        return;

    }

    if(plans[number]){

        document.getElementById("routeName").value=plans[number].route;

        document.getElementById("historyBtn").classList.remove("hidden");

        document.getElementById("missionBtn").classList.remove("hidden");

    }else{

        alert("رقم الخطة غير موجود");

        document.getElementById("routeName").value="";

        document.getElementById("historyBtn").classList.add("hidden");

        document.getElementById("missionBtn").classList.add("hidden");

    }

};


// بدء المهمة

document.getElementById("missionBtn").onclick=function(){

    alert("الخطوة التالية ستكون صفحة المهمة.");

};


// السجل

document.getElementById("historyBtn").onclick=function(){

    alert("الخطوة التالية ستكون صفحة السجل.");

};
