window.onload = function () {

    setTimeout(function () {

        document.getElementById("splashScreen").style.display = "none";
        document.getElementById("welcomeScreen").classList.remove("hidden");

    }, 2000);

    document.getElementById("startBtn").onclick = function () {

        document.getElementById("welcomeScreen").classList.add("hidden");
        document.getElementById("homePage").classList.remove("hidden");

    };

    document.getElementById("searchBtn").onclick = function () {

        let number = document.getElementById("planNumber").value;

        if (plans[number]) {

            document.getElementById("routeName").value = plans[number].route;

            document.getElementById("historyBtn").style.display = "block";
            document.getElementById("missionBtn").style.display = "block";

        } else {

            alert("رقم الخطة غير موجود");

        }

    };

    document.getElementById("missionBtn").onclick = function () {

        window.location.href = "mission.html";

    };

    document.getElementById("historyBtn").onclick = function () {

        window.location.href = "history.html";

    };

};
