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

}//======================================
// التاريخ والوقت الحالي
//======================================

function getNow(){

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth()+1)
    .padStart(2,"0");

    const day = String(now.getDate())
    .padStart(2,"0");

    const hour = String(now.getHours())
    .padStart(2,"0");

    const minute = String(now.getMinutes())
    .padStart(2,"0");

    return `${year}-${month}-${day}T${hour}:${minute}`;

}



//======================================
// حساب مدة الرصد
//======================================

function calculateHours(start,end,result){

    if(start.value==="" || end.value===""){

        result.value="";

        return;

    }

    const startDate = new Date(start.value);

    const endDate = new Date(end.value);

    const diff =
    endDate-startDate;

    if(diff<=0){

        result.value="";

        return;

    }

    const totalMinutes =
    Math.floor(diff/60000);

    const hours =
    Math.floor(totalMinutes/60);

    const minutes =
    totalMinutes%60;

    result.value =
    hours+" ساعة "+
    minutes+" دقيقة";

}//======================================
// تحديث نسبة الإنجاز
//======================================

function updateProgress(){

    const statusList =
    document.querySelectorAll(".statusSelect");

    let completed = 0;

    statusList.forEach(function(item){

        if(item.value!==""){

            completed++;

        }

    });

    completedSites.textContent = completed;

    const total = statusList.length;

    if(total===0){

        progressFill.style.width="0%";

        return;

    }

    const percent =
    Math.round((completed/total)*100);

    progressFill.style.width =
    percent+"%";

}



//======================================
// حفظ تلقائي
//======================================

function autoSave(){

    const data = {};

    data.plan = planNumber;

    data.route = routeInput.value;

    data.operator =
    operatorInput.value;

    data.employee =
    employeeInput.value;

    data.car =
    carInput.value;

    data.laptop =
    laptopInput.value;

    data.flash =
    flashInput.value;

    data.hdd =
    hddInput.value;

    data.start =
    missionStartInput.value;

    data.end =
    missionEndInput.value;

    data.workHours =
    workHoursInput.value;

    data.rows=[];

    document
    .querySelectorAll("#sitesBody tr")
    .forEach(function(row){

        data.rows.push({

            status:
            row.querySelector(".statusSelect").value,

            start:
            row.querySelector(".startRecord").value,

            end:
            row.querySelector(".endRecord").value,

            hours:
            row.querySelector(".recordHours").value,

            notes:
            row.querySelector(".notes").value

        });

    });

    localStorage.setItem(

        "mission_"+planNumber,

        JSON.stringify(data)

    );

}//======================================
// استعادة المهمة المحفوظة
//======================================

function restoreMission(){

    const saved = localStorage.getItem(
        "mission_" + planNumber
    );

    if(!saved){
        return;
    }

    const data = JSON.parse(saved);

    operatorInput.value = data.operator || "";
    employeeInput.value = data.employee || "";
    carInput.value = data.car || "";
    laptopInput.value = data.laptop || "";
    flashInput.value = data.flash || "";
    hddInput.value = data.hdd || "";

    missionStartInput.value = data.missionStart || "";
    missionEndInput.value = data.missionEnd || "";
    workHoursInput.value = data.workHours || "";

    const rows = document.querySelectorAll("#sitesBody tr");

    rows.forEach(function(row,index){

        if(!data.rows[index]) return;

        row.querySelector(".statusSelect").value =
        data.rows[index].status;

        row.querySelector(".startRecord").value =
        data.rows[index].start;

        row.querySelector(".endRecord").value =
        data.rows[index].end;

        row.querySelector(".recordHours").value =
        data.rows[index].duration;

        row.querySelector(".notes").value =
        data.rows[index].notes;

    });

    updateProgress();

}



//======================================
// حفظ تلقائي عند أي تعديل
//======================================

document.addEventListener("input",function(){

    autoSave();

});

document.addEventListener("change",function(){

    autoSave();

});



//======================================
// إنهاء المهمة
//======================================

document
.getElementById("finishBtn")
.addEventListener("click",finishMission);

function finishMission(){

    const now = new Date();

    missionEndInput.value =
    formatDateTime(now);

    calculateMissionHours();

    autoSave();

    alert("تم إنهاء المهمة بنجاح.");

}//======================================
// ربط أزرار الإجراءات
//======================================

document.getElementById("saveBtn").addEventListener("click",function(){

    autoSave();

    alert("تم حفظ المهمة بنجاح.");

});



document.getElementById("printBtn").addEventListener("click",function(){

    window.print();

});



document.getElementById("copyLinkBtn").addEventListener("click",function(){

    navigator.clipboard.writeText(window.location.href);

    alert("تم نسخ رابط المهمة.");

});



document.getElementById("shareBtn").addEventListener("click",async function(){

    if(navigator.share){

        try{

            await navigator.share({

                title:"المهمة الميدانية",

                text:"مشاركة المهمة",

                url:window.location.href

            });

        }catch(e){

            console.log(e);

        }

    }else{

        alert("المشاركة غير مدعومة في هذا المتصفح.");

    }

});



//======================================
// زر PDF
//======================================

document.getElementById("pdfBtn").addEventListener("click",function(){

    alert("سيتم تفعيل تصدير PDF بعد ربط مكتبة PDF.");

});



//======================================
// زر Excel
//======================================

document.getElementById("excelBtn").addEventListener("click",function(){

    alert("سيتم تفعيل تصدير Excel بعد ربط المكتبة.");

});



//======================================
// تحديث ساعات المهمة كل دقيقة
//======================================

setInterval(function(){

    calculateMissionHours();

},60000);//======================================
// استعادة البيانات عند تشغيل الصفحة
//======================================

window.addEventListener("load",function(){

    restoreMission();

});



//======================================
// تحديث نسبة الإنجاز بعد الاستعادة
//======================================

setTimeout(function(){

    updateProgress();

},300);



//======================================
// حفظ تلقائي كل 30 ثانية
//======================================

setInterval(function(){

    autoSave();

},30000);



//======================================
// حفظ قبل إغلاق الصفحة
//======================================

window.addEventListener("beforeunload",function(){

    autoSave();

});



//======================================
// مراقبة الاتصال بالإنترنت
//======================================

window.addEventListener("offline",function(){

    console.log("تم فقد الاتصال بالإنترنت");

});



window.addEventListener("online",function(){

    console.log("تم استعادة الاتصال");

    autoSave();

});



//======================================
// تفعيل ألوان الصفوف بعد الاستعادة
//======================================

document.querySelectorAll(".statusSelect")
.forEach(function(select){

    select.dispatchEvent(

        new Event("change")

    );

});



//======================================
// نهاية mission.js
//======================================
