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

    // شاشة البداية

    setTimeout(function(){

        splash.classList.add("hidden");

        welcome.classList.remove("hidden");

        setTimeout(function(){

            welcome.classList.add("hidden");

            home.classList.remove("hidden");

        },3000);

    },2000);    //========================================
    // البحث عن الخطة
    //========================================

    searchBtn.onclick = function () {

        const number = planNumber.value.trim();

        if (number === "") {

            alert("أدخل رقم الخطة أولاً");

            planNumber.focus();

            return;

        }

        if (!plans[number]) {

            alert("رقم الخطة غير موجود");

            planNumber.focus();

            return;

        }

        routeName.value = plans[number].route;

        searchCard.classList.add("hidden");

        routeCard.classList.remove("hidden");

        actionButtons.classList.remove("hidden");

    };



    //========================================
    // الرجوع
    //========================================

    backBtn.onclick = function () {

        routeCard.classList.add("hidden");

        actionButtons.classList.add("hidden");

        searchCard.classList.remove("hidden");

        routeName.value = "";

        planNumber.focus();

    };    //========================================
    // بدء المهمة
    //========================================

    missionBtn.onclick = function () {

        const number = planNumber.value.trim();

        if (number === "") {

            alert("أدخل رقم الخطة أولاً");

            return;

        }

        if (!plans[number]) {

            alert("رقم الخطة غير موجود");

            return;

        }

        window.location.href =
        "mission.html?plan=" +
        encodeURIComponent(number);

    };



    //========================================
    // سجل العمليات
    //========================================

    historyBtn.onclick = function () {

        window.location.href = "history.html";

    };



    //========================================
    // البحث عند الضغط على Enter
    //========================================

    planNumber.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            searchBtn.click();

        }

    });

});
