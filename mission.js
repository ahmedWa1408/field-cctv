//==================================================
// mission.js
// نظام الحركة الميدانية CCTV
// الإصدار النهائي
//==================================================

//--------------- عناصر الصفحة ----------------//

const params = new URLSearchParams(window.location.search);

const planNumber = params.get("plan");

let currentPlan = null;

const planInput = document.getElementById("planNumber");
const routeInput = document.getElementById("routeName");

const operatorInput = document.getElementById("operatorName");
const employeeInput = document.getElementById("employeeId");
const carInput = document.getElementById("carNumber");
const laptopInput = document.getElementById("laptopNumber");
const flashInput = document.getElementById("flashCount");
const hddInput = document.getElementById("hddCount");

const missionStartInput = document.getElementById("missionStart");
const missionEndInput = document.getElementById("missionEnd");
const workHoursInput = document.getElementById("workHours");

const progressFill = document.getElementById("progressFill");
const completedSites = document.getElementById("completedSites");
const totalSites = document.getElementById("totalSites");

const sitesBody = document.getElementById("sitesBody");



//==================================================
// بداية الصفحة
//==================================================

window.onload = function () {

    if (!planNumber) {

        alert("لم يتم اختيار رقم الخطة");

        window.location.href = "index.html";

        return;

    }

    if (!plans[planNumber]) {

        alert("الخطة غير موجودة");

        window.location.href = "index.html";

        return;

    }

    currentPlan = plans[planNumber];

    planInput.value = planNumber;

    routeInput.value = currentPlan.route;

    startMission();

    buildSitesTable();

    restoreMission();

};



//==================================================
// بداية المهمة
//==================================================

function startMission() {

    if (missionStartInput.value !== "") return;

    missionStartInput.value = formatDateTime(new Date());

}



//==================================================
// تنسيق التاريخ والوقت
//==================================================

function formatDateTime(date) {

    const d = String(date.getDate()).padStart(2, "0");

    const m = String(date.getMonth() + 1).padStart(2, "0");

    const y = date.getFullYear();

    const h = String(date.getHours()).padStart(2, "0");

    const min = String(date.getMinutes()).padStart(2, "0");

    return `${d}/${m}/${y} ${h}:${min}`;

}//==================================================
// إنشاء جدول المواقع
//==================================================

function buildSitesTable() {

    sitesBody.innerHTML = "";

    totalSites.textContent = currentPlan.sites.length;

    currentPlan.sites.forEach(function (site, index) {

        const row = document.createElement("tr");

        row.innerHTML = `

<td>${index + 1}</td>

<td>${site.code}</td>

<td>${site.storage}</td>

<td>

<a href="${site.map}"
target="_blank"
class="mapBtn">

📍 فتح الموقع

</a>

</td>

<td>

<select class="statusSelect">

<option value="">اختر الحالة</option>

<option value="working">🟢 يعمل</option>

<option value="workingClean">🟠 يعمل ولا توجد مخالفات</option>

<option value="brokenViolation">🟤 لا يعمل وتوجد مخالفات</option>

<option value="broken">🔴 لا يعمل ولا توجد مخالفات</option>

</select>

</td>

<td>

<input
type="date"
class="startDate">

</td>

<td>

<input
type="time"
class="startTime">

</td>

<td>

<input
type="date"
class="endDate">

</td>

<td>

<input
type="time"
class="endTime">

</td>

<td>

<input
type="text"
class="recordHours"
readonly
placeholder="تحسب تلقائياً">

</td>

<td>

<input
type="file"
class="photoInput"
accept="image/*">

</td>

<td>

<textarea
class="notes"
placeholder="اكتب الملاحظات"></textarea>

</td>

`;

        sitesBody.appendChild(row);

    });

    activateTable();

}//==================================================
// تشغيل الجدول
//==================================================

function activateTable() {

    const rows = document.querySelectorAll("#sitesBody tr");

    rows.forEach(function (row) {

        const status = row.querySelector(".statusSelect");

        const startDate = row.querySelector(".startDate");
        const startTime = row.querySelector(".startTime");

        const endDate = row.querySelector(".endDate");
        const endTime = row.querySelector(".endTime");

        const hours = row.querySelector(".recordHours");

        // تعبئة التاريخ تلقائياً

        startDate.addEventListener("focus", function () {

            if (startDate.value === "") {

                startDate.value = getToday();

            }

        });

        endDate.addEventListener("focus", function () {

            if (endDate.value === "") {

                endDate.value = getToday();

            }

        });

        // تعبئة الوقت تلقائياً

        startTime.addEventListener("focus", function () {

            if (startTime.value === "") {

                startTime.value = getTimeNow();

            }

        });

        endTime.addEventListener("focus", function () {

            if (endTime.value === "") {

                endTime.value = getTimeNow();

            }

        });

        // حساب مدة الرصد

        startDate.addEventListener("change", function () {

            calculateRecordHours(row);

        });

        startTime.addEventListener("change", function () {

            calculateRecordHours(row);

        });

        endDate.addEventListener("change", function () {

            calculateRecordHours(row);

        });

        endTime.addEventListener("change", function () {

            calculateRecordHours(row);

        });

        // تغيير لون الصف

        status.addEventListener("change", function () {

            row.classList.remove(
                "status-working",
                "status-warning",
                "status-brown",
                "status-danger"
            );

            switch (status.value) {

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

            autoSave();

        });

    });

}//==================================================
// تاريخ اليوم
//==================================================

function getToday() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}



//==================================================
// الوقت الحالي
//==================================================

function getTimeNow() {

    const now = new Date();

    const hour = String(now.getHours()).padStart(2, "0");

    const minute = String(now.getMinutes()).padStart(2, "0");

    return `${hour}:${minute}`;

}



//==================================================
// حساب مدة الرصد
//==================================================

function calculateRecordHours(row) {

    const startDate = row.querySelector(".startDate").value;

    const startTime = row.querySelector(".startTime").value;

    const endDate = row.querySelector(".endDate").value;

    const endTime = row.querySelector(".endTime").value;

    const result = row.querySelector(".recordHours");

    if (
        startDate === "" ||
        startTime === "" ||
        endDate === "" ||
        endTime === ""
    ) {

        result.value = "";

        return;

    }

    const start = new Date(startDate + "T" + startTime);

    const end = new Date(endDate + "T" + endTime);

    const diff = end - start;

    if (diff <= 0) {

        result.value = "";

        return;

    }

    const totalMinutes = Math.floor(diff / 60000);

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    result.value = hours + " ساعة " + minutes + " دقيقة";

    autoSave();

}//==================================================
// تحديث نسبة الإنجاز
//==================================================

function updateProgress() {

    const statusList =
    document.querySelectorAll(".statusSelect");

    let completed = 0;

    statusList.forEach(function (item) {

        if (item.value !== "") {

            completed++;

        }

    });

    completedSites.textContent = completed;

    totalSites.textContent = statusList.length;

    let percent = 0;

    if (statusList.length > 0) {

        percent = Math.round(
            (completed / statusList.length) * 100
        );

    }

    progressFill.style.width = percent + "%";

}



//==================================================
// حساب ساعات المهمة
//==================================================

function calculateMissionHours() {

    if (missionStartInput.value === "") {

        return;

    }

    const now = new Date();

    missionEndInput.value = formatDateTime(now);

    const start = new Date(
        missionStartInput.value.replace(
            /(\d{2})\/(\d{2})\/(\d{4})/,
            "$3-$2-$1"
        )
    );

    const diff = now - start;

    if (diff <= 0) {

        workHoursInput.value = "";

        return;

    }

    const totalMinutes = Math.floor(diff / 60000);

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    workHoursInput.value =
        hours + " ساعة " +
        minutes + " دقيقة";

}//==================================================
// الحفظ التلقائي
//==================================================

function autoSave() {

    const data = {

        plan: planNumber,

        route: routeInput.value,

        operator: operatorInput.value,

        employee: employeeInput.value,

        car: carInput.value,

        laptop: laptopInput.value,

        flash: flashInput.value,

        hdd: hddInput.value,

        missionStart: missionStartInput.value,

        missionEnd: missionEndInput.value,

        workHours: workHoursInput.value,

        rows: []

    };

    document.querySelectorAll("#sitesBody tr").forEach(function (row) {

        data.rows.push({

            status: row.querySelector(".statusSelect").value,

            startDate: row.querySelector(".startDate").value,

            startTime: row.querySelector(".startTime").value,

            endDate: row.querySelector(".endDate").value,

            endTime: row.querySelector(".endTime").value,

            duration: row.querySelector(".recordHours").value,

            notes: row.querySelector(".notes").value

        });

    });

    localStorage.setItem(

        "mission_" + planNumber,

        JSON.stringify(data)

    );

}



//==================================================
// استعادة المهمة
//==================================================

function restoreMission() {

    const saved = localStorage.getItem(

        "mission_" + planNumber

    );

    if (!saved) {

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

    rows.forEach(function (row, index) {

        if (!data.rows[index]) return;

        row.querySelector(".statusSelect").value =
        data.rows[index].status;

        row.querySelector(".startDate").value =
        data.rows[index].startDate;

        row.querySelector(".startTime").value =
        data.rows[index].startTime;

        row.querySelector(".endDate").value =
        data.rows[index].endDate;

        row.querySelector(".endTime").value =
        data.rows[index].endTime;

        row.querySelector(".recordHours").value =
        data.rows[index].duration;

        row.querySelector(".notes").value =
        data.rows[index].notes;

    });

    updateProgress();

}//==================================================
// إنهاء المهمة
//==================================================

function finishMission() {

    calculateMissionHours();

    autoSave();

    alert("تم إنهاء المهمة بنجاح.");

}



//==================================================
// ربط الأزرار
//==================================================

document.getElementById("finishBtn").addEventListener("click", finishMission);



document.getElementById("saveBtn").addEventListener("click", function () {

    autoSave();

    alert("تم حفظ المهمة.");

});



document.getElementById("printBtn").addEventListener("click", function () {

    window.print();

});



document.getElementById("copyLinkBtn").addEventListener("click", function () {

    navigator.clipboard.writeText(window.location.href);

    alert("تم نسخ رابط المهمة.");

});



document.getElementById("shareBtn").addEventListener("click", async function () {

    if (navigator.share) {

        await navigator.share({

            title: "المهمة الميدانية",

            text: "مشاركة المهمة",

            url: window.location.href

        });

    } else {

        alert("المشاركة غير مدعومة.");

    }

});



document.getElementById("pdfBtn").addEventListener("click", function () {

    exportPDF();

});



document.getElementById("excelBtn").addEventListener("click", function () {

    exportExcel();

});



//==================================================
// حفظ تلقائي كل 30 ثانية
//==================================================

setInterval(function(){

    autoSave();

},30000);



//==================================================
// حفظ قبل إغلاق الصفحة
//==================================================

window.addEventListener("beforeunload",function(){

    autoSave();

});//==================================================
// إعادة تفعيل الصفوف بعد الاستعادة
//==================================================

function refreshTable() {

    document.querySelectorAll("#sitesBody tr").forEach(function (row) {

        const status = row.querySelector(".statusSelect");

        row.classList.remove(
            "status-working",
            "status-warning",
            "status-brown",
            "status-danger"
        );

        switch (status.value) {

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

    });

    updateProgress();

}



//==================================================
// حفظ الصورة (المرحلة الأولى)
//==================================================

document.querySelectorAll(".photoInput").forEach(function(input){

    input.addEventListener("change",function(){

        autoSave();

    });

});



//==================================================
// حفظ عند تعديل أي حقل
//==================================================

document.addEventListener("input",function(){

    autoSave();

});

document.addEventListener("change",function(){

    autoSave();

});



//==================================================
// استعادة ألوان الجدول
//==================================================

setTimeout(function(){

    refreshTable();

},200);



//==================================================
// تحديث ساعات المهمة كل دقيقة
//==================================================

setInterval(function(){

    calculateMissionHours();

},60000);



//==================================================
// نهاية mission.js
//==================================================
