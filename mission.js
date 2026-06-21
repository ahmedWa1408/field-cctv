// ======================================
// CCTV FIELD SYSTEM
// mission.js
// الإصدار الأول
// ======================================

let currentPlan = null;
let missionData = null;

const params = new URLSearchParams(window.location.search);

const planNumber = params.get("plan");

const planInput = document.getElementById("planNumber");
const routeInput = document.getElementById("routeName");

const operatorInput = document.getElementById("operatorName");
const employeeInput = document.getElementById("employeeId");
const carInput = document.getElementById("carNumber");
const laptopInput = document.getElementById("laptopNumber");
const flashInput = document.getElementById("flashCount");
const hddInput = document.getElementById("hddCount");

const missionStartInput =
document.getElementById("missionStart");

const missionEndInput =
document.getElementById("missionEnd");

const workHoursInput =
document.getElementById("workHours");

const progressFill =
document.getElementById("progressFill");

const completedSites =
document.getElementById("completedSites");

const totalSites =
document.getElementById("totalSites");

const sitesBody =
document.getElementById("sitesBody");


//======================================
// بدء الصفحة
//======================================

window.onload = function(){

    if(!planNumber){

        alert("لم يتم اختيار خطة.");

        window.location.href="index.html";

        return;

    }

    if(!plans[planNumber]){

        alert("الخطة غير موجودة.");

        window.location.href="index.html";

        return;

    }

    currentPlan = plans[planNumber];

    planInput.value = planNumber;

    routeInput.value = currentPlan.route;

    startMission();

    buildSitesTable();

};//======================================
// تسجيل بداية المهمة
//======================================

function startMission(){

    const now = new Date();

    missionStartInput.value = formatDateTime(now);

    missionStartInput.readOnly = true;

}



//======================================
// تنسيق التاريخ والوقت
//======================================

function formatDateTime(date){

    let day =
    String(date.getDate()).padStart(2,"0");

    let month =
    String(date.getMonth()+1).padStart(2,"0");

    let year =
    date.getFullYear();

    let hour =
    String(date.getHours()).padStart(2,"0");

    let minute =
    String(date.getMinutes()).padStart(2,"0");

    return `${day}/${month}/${year} ${hour}:${minute}`;

}



//======================================
// إنشاء الجدول
//======================================

function buildSitesTable(){

    sitesBody.innerHTML="";

    totalSites.textContent =
    currentPlan.sites.length;

    currentPlan.sites.forEach(function(site,index){

        let row =
        document.createElement("tr");

        row.dataset.index=index;

        row.innerHTML=`

<td>${index+1}</td>

<td>${site.code}</td>

<td>${site.storage}</td>

<td>

<button
class="mapBtn"
onclick="window.open('${site.map}')">

📍 الموقع

</button>

</td>

<td>

<select class="statusSelect">

<option value="">اختر</option>

<option value="working">

🟢 يعمل

</option>

<option value="workingClean">

🟠 يعمل ولا توجد مخالفات

</option>

<option value="brokenViolation">

🟤 لا يعمل وتوجد مخالفات

</option>

<option value="broken">

🔴 لا يعمل ولا توجد مخالفات

</option>

</select>

</td><td>

<input
type="datetime-local"
class="startRecord">

</td>

<td>

<input
type="datetime-local"
class="endRecord">

</td>

<td>

<input
type="text"
class="recordHours"
readonly
placeholder="تحسب تلقائياً">

</td>

<td>

<button class="photoBtn">

📷 صورة

</button>

</td>

<td>

<textarea
class="notes"
placeholder="اكتب الملاحظات"></textarea>

</td>

`;

        sitesBody.appendChild(row);

    });

    prepareRows();

}



//======================================
// تجهيز الصفوف
//======================================

function prepareRows(){

const rows=document.querySelectorAll("#sitesBody tr");

rows.forEach(function(row){

const start=row.querySelector(".startRecord");

const end=row.querySelector(".endRecord");

const hours=row.querySelector(".recordHours");

const status=row.querySelector(".statusSelect");



// تعبئة الوقت الحالي تلقائياً

start.addEventListener("focus",function(){

if(start.value===""){

start.value=getNow();

}

});



end.addEventListener("focus",function(){

if(end.value===""){

end.value=getNow();

}

});



// حساب مدة الرصد

start.addEventListener("change",function(){

calculateHours(start,end,hours);

});



end.addEventListener("change",function(){

calculateHours(start,end,hours);

});



// تغيير لون الصف

status.addEventListener("change",function(){

row.className="";

switch(status.value){

case "working":

row.classList.add("status-working");

break;

case "workingClean":

row.classList.add("status-warning");

break;

case "brokenViolation":

row.classList.add("status-brown");

break;

case "broken":

row.classList.add("status-danger");

break;

}

updateProgress();

});

});

}
