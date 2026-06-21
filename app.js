// =============================
// العناصر
// =============================

const splashScreen = document.getElementById("splashScreen");
const welcomeScreen = document.getElementById("welcomeScreen");
const homePage = document.getElementById("homePage");

const startBtn = document.getElementById("startBtn");
const searchBtn = document.getElementById("searchBtn");

const historyBtn = document.getElementById("historyBtn");
const missionBtn = document.getElementById("missionBtn");

const planNumber = document.getElementById("planNumber");
const routeName = document.getElementById("routeName");

// =============================
// شاشة البداية
// =============================

window.addEventListener("load", () => {

    setTimeout(() => {

        splashScreen.classList.add("hidden");
        welcomeScreen.classList.remove("hidden");

    }, 1800);

});

// =============================
// دخول النظام
// =============================

startBtn.addEventListener("click", () => {

    welcomeScreen.classList.add("hidden");
    homePage.classList.remove("hidden");

});

// =============================
// البحث عن الخطة
// =============================

searchBtn.addEventListener("click", () => {

    const number = planNumber.value.trim();

    if (number === "") {

        alert("يرجى إدخال رقم الخطة");

        return;

    }

    if (plans[number]) {

        routeName.value = plans[number].route;

        historyBtn.style.display = "block";
        missionBtn.style.display = "block";

    } else {

        routeName.value = "";

        historyBtn.style.display = "none";
        missionBtn.style.display = "none";

        alert("رقم الخطة غير موجود");

    }

});

// =============================
// بدء المهمة
// =============================

missionBtn.addEventListener("click", () => {

    localStorage.setItem("planNumber", planNumber.value);
    localStorage.setItem("routeName", routeName.value);

    window.location.href = "mission.html";

});

// =============================
// السجل
// =============================

historyBtn.addEventListener("click", () => {

    window.location.href = "history.html";

});
