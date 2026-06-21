// =========================
// تشغيل النظام
// =========================

const splashScreen = document.getElementById("splashScreen");
const welcomeScreen = document.getElementById("welcomeScreen");
const homePage = document.getElementById("homePage");

const startBtn = document.getElementById("startBtn");

window.addEventListener("load", () => {

    setTimeout(() => {

        splashScreen.classList.add("hidden");

        welcomeScreen.classList.remove("hidden");

    }, 3000);

});

startBtn.addEventListener("click", () => {

    welcomeScreen.classList.add("hidden");

    homePage.classList.remove("hidden");

});// =========================
// عناصر البحث
// =========================

const planNumber = document.getElementById("planNumber");

const routeName = document.getElementById("routeName");

const searchBtn = document.getElementById("searchBtn");

const missionBtn = document.getElementById("missionBtn");

const historyBtn = document.getElementById("historyBtn");// =========================
// البحث عن الخطة
// =========================

searchBtn.addEventListener("click", () => {

    const number = planNumber.value.trim();

    if(number===""){

        alert("الرجاء إدخال رقم الخطة");

        return;

    }

    if(!plans[number]){

        alert("رقم الخطة غير موجود");

        return;

    }

    routeName.value = plans[number].route;

    missionBtn.style.display="block";

    historyBtn.style.display="block";

});// =========================
// بدء المهمة
// =========================

missionBtn.addEventListener("click", () => {

    localStorage.setItem("currentPlan", planNumber.value);

    localStorage.setItem("currentRoute", routeName.value);

    window.location.href = "mission.html";// =========================
// سجل العمليات
// =========================

historyBtn.addEventListener("click", () => {

    localStorage.setItem("currentPlan", planNumber.value);

    localStorage.setItem("currentRoute", routeName.value);

    window.location.href = "history.html";// =========================
// البحث بالضغط على Enter
// =========================

planNumber.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        searchBtn.click();

    }

});

});

});
