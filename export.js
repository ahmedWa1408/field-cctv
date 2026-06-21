//======================================
// export.js
//======================================

// نسخ الرابط

function copyMissionUrl(plan){

    const url=

    window.location.origin+

    "/mission.html?plan="+plan;

    navigator.clipboard.writeText(url);

    alert("تم نسخ رابط المهمة.");

}



//======================================
// مشاركة
//======================================

async function shareMissionUrl(plan){

    const url=

    window.location.origin+

    "/mission.html?plan="+plan;

    if(navigator.share){

        await navigator.share({

            title:"المهمة الميدانية",

            text:"مشاركة المهمة",

            url:url

        });

    }

}//======================================
// طباعة
//======================================

function printMission(){

    window.print();

}



//======================================
// PDF
//======================================

function exportPDF(){

    alert(

"سيتم إنشاء ملف PDF بعد ربط مكتبة jsPDF."

    );

}



//======================================
// Excel
//======================================

function exportExcel(){

    alert(

"سيتم إنشاء ملف Excel بعد ربط مكتبة SheetJS."

    );

}//======================================
// ربط الأزرار
//======================================

if(document.getElementById("pdfBtn")){

document.getElementById("pdfBtn")

.onclick=exportPDF;

}



if(document.getElementById("excelBtn")){

document.getElementById("excelBtn")

.onclick=exportExcel;

}



if(document.getElementById("printBtn")){

document.getElementById("printBtn")

.onclick=printMission;

}
