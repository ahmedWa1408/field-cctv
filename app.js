document.addEventListener("DOMContentLoaded", function () {

    const splash = document.getElementById("splashScreen");
    const welcome = document.getElementById("welcomeScreen");
    const home = document.getElementById("homePage");

    const searchBtn = document.getElementById("searchBtn");
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

        }, 3000);

    }, 2000);

    // البحث
    searchBtn.addEventListener("click", function () {

        const number = planNumber.value.trim();

        if (!number) {
            alert("أدخل رقم الخطة");
            return;
        }

        if (plans[number]) {

            routeName.value = plans[number].route;

            historyBtn.classList.remove("hidden");
            missionBtn.classList.remove("hidden");

        } else {

            alert("رقم الخطة غير موجود");

            routeName.value = "";

            historyBtn.classList.add("hidden");
            missionBtn.classList.add("hidden");
        }

    });

    missionBtn.addEventListener("click", function () {
        alert("صفحة المهمة سيتم إنشاؤها في الخطوة التالية.");
    });

    historyBtn.addEventListener("click", function () {
        alert("صفحة السجل سيتم إنشاؤها في الخطوة التالية.");
    });

});
