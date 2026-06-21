window.onload = function () {
    alert("تم تحميل JavaScript");

    setTimeout(function () {
        alert("بعد ثانيتين");

        document.getElementById("splashScreen").style.display = "none";
        document.getElementById("welcomeScreen").classList.remove("hidden");
    }, 2000);
};
