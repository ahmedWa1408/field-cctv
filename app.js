document.addEventListener("DOMContentLoaded", function () {

    const splash = document.getElementById("splashScreen");
    const welcome = document.getElementById("welcomeScreen");
    const home = document.getElementById("homePage");

    const searchCard = document.getElementById("searchCard");
    const routeCard = document.getElementById("routeCard");
    const actionButtons = document.getElementById("actionButtons");

    const searchBtn = document.getElementById("searchBtn");
    const backBtn = document.getElementById("backBtn");
    const missionBtn = document.getElementById("missionBtn");
    const historyBtn = document.getElementById("historyBtn");

    const planNumber = document.getElementById("planNumber");
    const routeName = document.getElementById("routeName");

    // شاشة الشعار
    setTimeout(function () {

        splash.classList.add("hidden");
        welcome.classList.remove("hidden");

        // رسالة الترحيب
        setTimeout(function () {

            welcome.classList.add("hidden");
            home.classList.remove("hidden");

        },3000);

    },2000);


    // البحث عن الخطة

    searchBtn.onclick = function(){

        let number = planNumber.value.trim();

        if(number===""){

            alert("أدخل رقم الخطة");
            return;

        }

        if(plans[number]){

            routeName.value = plans[number].route;

            searchCard.classList.add("hidden");

            routeCard.classList.remove("hidden");

            actionButtons.classList.remove("hidden");

        }else{

            alert("رقم الخطة غير موجود");

        }

    };


    // الرجوع

    backBtn.onclick = function(){

        searchCard.classList.remove("hidden");

        routeCard.classList.add("hidden");

        actionButtons.classList.add("hidden");

        planNumber.focus();

    };


    // بدء المهمة

    missionBtn.onclick = function(){

        alert("سيتم فتح صفحة المهمة في الخطوة القادمة.");

    };


    // السجل

    historyBtn.onclick = function(){

        alert("سيتم فتح سجل العمليات السابقة.");

    };

});
