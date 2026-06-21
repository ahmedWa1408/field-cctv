//======================================
// history.js
//======================================

let missions = [];

const historyBody =
document.getElementById("historyBody");

const totalMissions =
document.getElementById("totalMissions");

const finishedMissions =
document.getElementById("finishedMissions");

const unfinishedMissions =
document.getElementById("unfinishedMissions");

const totalSitesDone =
document.getElementById("totalSitesDone");

const searchInput =
document.getElementById("searchInput");

const dateFilter =
document.getElementById("dateFilter");

const carFilter =
document.getElementById("carFilter");

window.onload=function(){

    loadHistory();

};



//======================================
// قراءة جميع المهام
//======================================

function loadHistory(){

    missions=[];

    for(let i=0;i<localStorage.length;i++){

        const key=
        localStorage.key(i);

        if(key.startsWith("mission_")){

            missions.push(

                JSON.parse(

                    localStorage.getItem(key)

                )

            );

        }

    }

    drawTable();

    updateStatistics();

}//======================================
// رسم الجدول
//======================================

function drawTable(){

    historyBody.innerHTML="";

    missions.forEach(function(mission,index){

        const row=document.createElement("tr");

        const completed =
        mission.rows.filter(r=>r.status!="").length;

        const total =
        mission.rows.length;

        const percent =
        total===0 ? 0 :
        Math.round((completed/total)*100);

        const state =
        mission.missionEnd ?
        "مكتملة" :
        "قيد التنفيذ";

        row.innerHTML=`

<td>${mission.plan}</td>

<td>${mission.route}</td>

<td>${mission.missionStart}</td>

<td>${mission.operator}</td>

<td>${mission.car}</td>

<td>${mission.workHours}</td>

<td>${percent}%</td>

<td>${state}</td>

<td>

<button
class="actionBtn viewBtn"
onclick="viewMission('${mission.plan}')">

👁️

</button>

<button
class="actionBtn editBtn"
onclick="continueMission('${mission.plan}')">

✏️

</button>

<button
class="actionBtn pdfBtn"
onclick="exportMissionPDF('${mission.plan}')">

📄

</button>

<button
class="actionBtn excelBtn"
onclick="exportMissionExcel('${mission.plan}')">

📊

</button>

<button
class="actionBtn printBtn"
onclick="printMission('${mission.plan}')">

🖨️

</button>

<button
class="actionBtn linkBtn"
onclick="copyMissionLink('${mission.plan}')">

🔗

</button>

<button
class="actionBtn shareBtn"
onclick="shareMission('${mission.plan}')">

📤

</button>

<button
class="actionBtn deleteBtn"
onclick="deleteMission('${mission.plan}')">

🗑️

</button>

</td>

`;

        historyBody.appendChild(row);

    });

}//======================================
// تحديث الإحصائيات
//======================================

function updateStatistics(){

    totalMissions.textContent =
    missions.length;

    let finished = 0;

    let sites = 0;

    missions.forEach(function(mission){

        if(mission.missionEnd){

            finished++;

        }

        mission.rows.forEach(function(row){

            if(row.status!=""){

                sites++;

            }

        });

    });

    finishedMissions.textContent =
    finished;

    unfinishedMissions.textContent =
    missions.length-finished;

    totalSitesDone.textContent =
    sites;

}



//======================================
// عرض المهمة
//======================================

function viewMission(plan){

    window.location.href =
    "mission.html?plan="+plan;

}



//======================================
// استكمال المهمة
//======================================

function continueMission(plan){

    window.location.href =
    "mission.html?plan="+plan;

}



//======================================
// حذف المهمة
//======================================

function deleteMission(plan){

    if(!confirm("هل تريد حذف المهمة؟")){

        return;

    }

    localStorage.removeItem(
        "mission_"+plan
    );

    loadHistory();

}



//======================================
// نسخ الرابط
//======================================

function copyMissionLink(plan){

    const url =
    window.location.origin+
    "/mission.html?plan="+plan;

    navigator.clipboard.writeText(url);

    alert("تم نسخ الرابط.");

}



//======================================
// مشاركة المهمة
//======================================

async function shareMission(plan){

    const url =
    window.location.origin+
    "/mission.html?plan="+plan;

    if(navigator.share){

        await navigator.share({

            title:"المهمة الميدانية",

            text:"مشاركة المهمة",

            url:url

        });

    }else{

        alert("المشاركة غير مدعومة.");

    }

}//======================================
// البحث والفلترة
//======================================

searchInput.addEventListener("input",filterHistory);

dateFilter.addEventListener("change",filterHistory);

carFilter.addEventListener("input",filterHistory);

function filterHistory(){

    const text =
    searchInput.value.toLowerCase();

    const date =
    dateFilter.value;

    const car =
    carFilter.value.toLowerCase();

    const rows =
    historyBody.querySelectorAll("tr");

    rows.forEach(function(row){

        const values =
        row.innerText.toLowerCase();

        let show = true;

        if(text!=="" &&
        !values.includes(text)){

            show=false;

        }

        if(car!=="" &&
        !values.includes(car)){

            show=false;

        }

        if(date!=="" &&
        !values.includes(date)){

            show=false;

        }

        row.style.display =
        show ? "" : "none";

    });

}



//======================================
// تحديث
//======================================

document
.getElementById("refreshBtn")
.onclick=function(){

    loadHistory();

};



//======================================
// طباعة السجل
//======================================

document
.getElementById("printAllBtn")
.onclick=function(){

    window.print();

};



//======================================
// PDF
//======================================

document
.getElementById("exportPdfBtn")
.onclick=function(){

    alert("سيتم تفعيل تصدير PDF بعد ربط export.js");

};



//======================================
// Excel
//======================================

document
.getElementById("exportExcelBtn")
.onclick=function(){

    alert("سيتم تفعيل Excel بعد ربط export.js");

};



//======================================
// نهاية history.js
//======================================
