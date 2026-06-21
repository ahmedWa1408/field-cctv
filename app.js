window.onload = function () {

setTimeout(function(){

document.getElementById("splashScreen").style.display="none";

document.getElementById("welcomeScreen").classList.remove("hidden");

},2000);

document.getElementById("startBtn").onclick=function(){

document.getElementById("welcomeScreen").classList.add("hidden");

document.getElementById("homePage").classList.remove("hidden");

};

};
