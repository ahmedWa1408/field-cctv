window.onload = function () {

    console.log("JavaScript بدأ");

    alert("1");

    setTimeout(function () {

        alert("2");

        document.getElementById("splashScreen").style.display = "none";

        document.getElementById("welcomeScreen").classList.remove("hidden");

    },2000);

};
