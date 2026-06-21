//======================================
// حفظ عند إغلاق الصفحة
//======================================

window.addEventListener(

"beforeunload",

function(){

    if(

    typeof currentPlan!="undefined"

    ){

        autoSaveMission(currentPlan);

    }

}

);



//======================================
// حفظ كل 20 ثانية
//======================================

setInterval(function(){

    if(

    typeof currentPlan!="undefined"

    ){

        autoSaveMission(currentPlan);

    }

},20000);



//======================================
// نهاية storage.js
//======================================
