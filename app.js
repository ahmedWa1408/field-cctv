document.addEventListener("DOMContentLoaded", function () {

    const searchBtn = document.getElementById("searchBtn");
    const missionBtn = document.getElementById("missionBtn");
    const historyBtn = document.getElementById("historyBtn");

    searchBtn.onclick = function () {

        const number = document.getElementById("planNumber").value.trim();

        if (number === "") {
            alert("الرجاء إدخال رقم الخطة");
            return;
        }

        if (plans[number]) {

            document.getElementById("routeName").value = plans[number].route;

            missionBtn.style.display = "block";
            historyBtn.style.display = "block";

        } else {

            alert("رقم الخطة غير موجود");

            document.getElementById("routeName").value = "";

            missionBtn.style.display = "none";
            historyBtn.style.display = "none";
        }

    };

    missionBtn.onclick = function () {
        alert("سيتم إنشاء صفحة المهمة في الخطوة التالية.");
    };

    historyBtn.onclick = function () {
        alert("سيتم إنشاء صفحة السجل في الخطوة التالية.");
    };

});
