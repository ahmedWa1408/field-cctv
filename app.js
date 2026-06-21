// شاشة البداية
window.onload = function () {

    setTimeout(function () {

        document.getElementById("splashScreen").style.display = "none";
        document.getElementById("welcomeScreen").classList.remove("hidden");

    }, 2000);

};


// دخول النظام
document.getElementById("startBtn").onclick = function () {

    document.getElementById("welcomeScreen").classList.add("hidden");

    document.getElementById("homePage").classList.remove("hidden");

};


// البحث عن الخطة
document.getElementById("searchBtn").onclick = function () {

    const number = document.getElementById("planNumber").value;

    if (plans[number]) {

        document.getElementById("routeName").value = plans[number].route;

        document.getElementById("historyBtn").style.display = "block";
        document.getElementById("missionBtn").style.display = "block";

    } else {

        alert("رقم الخطة غير موجود");

        document.getElementById("routeName").value = "";

        document.getElementById("historyBtn").style.display = "none";
        document.getElementById("missionBtn").style.display = "none";

    }

};


// بدء المهمة
document.getElementById("missionBtn").onclick = function () {

    alert("سيتم إنشاء صفحة المهمة في الخطوة التالية.");

};


// السجل
document.getElementById("historyBtn").onclick = function () {

    alert("سيتم إنشاء صفحة السجل في الخطوة التالية.");

};
