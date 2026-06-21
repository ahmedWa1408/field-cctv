//======================================================
// الحركة الميدانية CCTV
// mission.js الإصدار النهائي
//======================================================

"use strict";

//======================================
// قراءة رقم الخطة
//======================================

const url=new URLSearchParams(window.location.search);

const planId=url.get("plan");

let currentPlan=null;


//======================================
// عناصر الصفحة
//======================================

const planNumber=document.getElementById("planNumber");
const routeName=document.getElementById("routeName");

const operatorName=document.getElementById("operatorName");
const employeeId=document.getElementById("employeeId");
const carNumber=document.getElementById("carNumber");
const laptopNumber=document.getElementById("laptopNumber");
const flashCount=document.getElementById("flashCount");
const hddCount=document.getElementById("hddCount");
const supervisor=document.getElementById("supervisor");

const missionStart=document.getElementById("missionStart");
const missionEnd=document.getElementById("missionEnd");
const workHours=document.getElementById("workHours");

const liveTimer=document.getElementById("liveTimer");

const progressPercent=document.getElementById("progressPercent");
const progressCircle=document.getElementById("progressCircle");

const completedSites=document.getElementById("completedSites");
const totalSites=document.getElementById("totalSites");

const completedCounter=document.getElementById("completedCounter");
const remainingCounter=document.getElementById("remainingCounter");

const sitesBody=document.getElementById("sitesBody");

const generalNotes=document.getElementById("generalNotes");


//======================================
// تشغيل الصفحة
//======================================

window.addEventListener("load",initMission);

function initMission(){

if(!planId){

location.href="index.html";

return;

}

if(!plans[planId]){

alert("الخطة غير موجودة");

location.href="index.html";

return;

}

currentPlan=plans[planId];

planNumber.textContent=planId;

routeName.value=currentPlan.route;

loadMission();

createMissionStart();

buildTable();

restoreMission();

startMissionTimer();

updateProgress();

}


//======================================
// بداية المهمة
//======================================

function createMissionStart(){

if(missionStart.value!="") return;

const saved=

localStorage.getItem(

"missionStart_"+planId

);

if(saved){

missionStart.value=saved;

return;

}

const now=new Date();

missionStart.value=formatDate(now);

localStorage.setItem(

"missionStart_"+planId,

missionStart.value

);

}


//======================================
// تنسيق التاريخ
//======================================

function formatDate(date){

const d=String(date.getDate()).padStart(2,"0");

const m=String(date.getMonth()+1).padStart(2,"0");

const y=date.getFullYear();

const h=String(date.getHours()).padStart(2,"0");

const i=String(date.getMinutes()).padStart(2,"0");

return d+"/"+m+"/"+y+" "+h+":"+i;

}


//======================================
// إنشاء الجدول
//======================================

function buildTable(){

sitesBody.innerHTML="";

totalSites.textContent=currentPlan.sites.length;

remainingCounter.textContent=currentPlan.sites.length;

currentPlan.sites.forEach((site,index)=>{

const tr=document.createElement("tr");

tr.dataset.index=index;

tr.innerHTML=`

<td>${index+1}</td>

<td>${site.code}</td>

<td>${site.storage}</td>

<td>

<a href="${site.map}"

target="_blank">

📍

</a>

</td>

<td>

<select class="xml">

<option value="">-</option>

<option>يوجد</option>

<option>لا يوجد</option>

</select>

</td>

<td>

<select class="status">

<option value="">اختر</option>

<option value="working">🟢 يعمل</option>

<option value="workingClean">🟠 يعمل ولا توجد مخالفات</option>

<option value="brokenViolation">🟤 لا يعمل وتوجد مخالفات</option>

<option value="broken">🔴 لا يعمل ولا توجد مخالفات</option>

</select>

</td>

<td>

<input type="date" class="startDate">

</td>

<td>

<input type="time" class="startTime">

</td>

<td>

<input type="date" class="endDate">

</td>

<td>

<input type="time" class="endTime">

</td>

<td>

<input type="text"

class="duration"

readonly>

</td>

<td>

<input

type="file"

accept="image/*"

capture="environment"

multiple

class="photo">

</td>

<td>

<textarea

class="notes"></textarea>

</td>

`;

sitesBody.appendChild(tr);

});

activateRows();

}//======================================
// تشغيل صفوف الجدول
//======================================

function activateRows(){

const rows=document.querySelectorAll("#sitesBody tr");

rows.forEach(row=>{

const xml=row.querySelector(".xml");
const status=row.querySelector(".status");

const startDate=row.querySelector(".startDate");
const startTime=row.querySelector(".startTime");

const endDate=row.querySelector(".endDate");
const endTime=row.querySelector(".endTime");

const duration=row.querySelector(".duration");

const notes=row.querySelector(".notes");



//========================
// بداية الرصد
//========================

startDate.addEventListener("focus",()=>{

if(startDate.value===""){

startDate.value=today();

}

});

startTime.addEventListener("focus",()=>{

if(startTime.value===""){

startTime.value=currentTime();

}

});



//========================
// نهاية الرصد
//========================

endDate.addEventListener("focus",()=>{

if(endDate.value===""){

endDate.value=today();

}

});

endTime.addEventListener("focus",()=>{

if(endTime.value===""){

endTime.value=currentTime();

}

});



//========================
// حساب المدة
//========================

[startDate,startTime,endDate,endTime]

.forEach(item=>{

item.addEventListener("change",()=>{

calculateDuration(row);

saveMission();

});

});



//========================
// XML
//========================

xml.addEventListener("change",()=>{

saveMission();

});



//========================
// الملاحظات
//========================

notes.addEventListener("input",()=>{

saveMission();

});



//========================
// حالة الموقع
//========================

status.addEventListener("change",()=>{

row.classList.remove(

"status-working",

"status-warning",

"status-brown",

"status-danger"

);

switch(status.value){

case"working":

row.classList.add("status-working");

break;

case"workingClean":

row.classList.add("status-warning");

break;

case"brokenViolation":

row.classList.add("status-brown");

break;

case"broken":

row.classList.add("status-danger");

break;

}

updateProgress();

saveMission();

});

});

}



//======================================
// تاريخ اليوم
//======================================

function today(){

const d=new Date();

return d.toISOString().split("T")[0];

}



//======================================
// الوقت الحالي
//======================================

function currentTime(){

const d=new Date();

return d.toTimeString().substring(0,5);

}//======================================
// حساب مدة الرصد
//======================================

function calculateDuration(row){

const startDate=row.querySelector(".startDate").value;
const startTime=row.querySelector(".startTime").value;

const endDate=row.querySelector(".endDate").value;
const endTime=row.querySelector(".endTime").value;

const duration=row.querySelector(".duration");

if(
startDate===""||
startTime===""||
endDate===""||
endTime===""
){

duration.value="";

return;

}

const start=new Date(startDate+"T"+startTime);

const end=new Date(endDate+"T"+endTime);

const diff=end-start;

if(diff<0){

duration.value="";

return;

}

const totalMinutes=Math.floor(diff/60000);

const hours=Math.floor(totalMinutes/60);

const minutes=totalMinutes%60;

duration.value=

hours+" ساعة "+minutes+" دقيقة";

saveMission();

}



//======================================
// تحديث مؤشر الإنجاز
//======================================

function updateProgress(){

const list=document.querySelectorAll(".status");

let completed=0;

list.forEach(item=>{

if(item.value!==""){

completed++;

}

});

completedSites.textContent=completed;

completedCounter.textContent=completed;

remainingCounter.textContent=

list.length-completed;

totalSites.textContent=list.length;

const percent=

list.length===0

?0

:Math.round((completed/list.length)*100);

progressPercent.textContent=

percent+"%";

const radius=70;

const circumference=

2*Math.PI*radius;

progressCircle.style.strokeDasharray=

circumference;

progressCircle.style.strokeDashoffset=

circumference-

(percent/100)*circumference;

}//======================================
// عداد المهمة المباشر
//======================================

let timer=null;

function startMissionTimer(){

if(timer){

clearInterval(timer);

}

timer=setInterval(()=>{

if(missionStart.value==="") return;

const start=parseMissionDate(

missionStart.value

);

const now=new Date();

const diff=now-start;

const totalSeconds=

Math.floor(diff/1000);

const hours=

Math.floor(totalSeconds/3600);

const minutes=

Math.floor((totalSeconds%3600)/60);

const seconds=

totalSeconds%60;

liveTimer.textContent=

String(hours).padStart(2,"0")+":"+

String(minutes).padStart(2,"0")+":"+

String(seconds).padStart(2,"0");

},1000);

}



//======================================
// تحويل التاريخ
//======================================

function parseMissionDate(value){

const p=value.split(" ");

const d=p[0].split("/");

const t=p[1].split(":");

return new Date(

d[2],

d[1]-1,

d[0],

t[0],

t[1]

);

}//======================================
// حفظ المهمة
//======================================

function saveMission(){

const data={

operator:operatorName.value,
employee:employeeId.value,
car:carNumber.value,
laptop:laptopNumber.value,
flash:flashCount.value,
hdd:hddCount.value,
supervisor:supervisor.value,

missionStart:missionStart.value,
missionEnd:missionEnd.value,
workHours:workHours.value,

generalNotes:generalNotes.value,

rows:[]

};

document.querySelectorAll("#sitesBody tr").forEach(row=>{

data.rows.push({

xml:row.querySelector(".xml").value,

status:row.querySelector(".status").value,

startDate:row.querySelector(".startDate").value,

startTime:row.querySelector(".startTime").value,

endDate:row.querySelector(".endDate").value,

endTime:row.querySelector(".endTime").value,

duration:row.querySelector(".duration").value,

notes:row.querySelector(".notes").value

});

});

localStorage.setItem(

"mission_"+planId,

JSON.stringify(data)

);

}



//======================================
// استرجاع المهمة
//======================================

function restoreMission(){

const saved=

localStorage.getItem(

"mission_"+planId

);

if(!saved){

return;

}

const data=

JSON.parse(saved);

operatorName.value=data.operator||"";
employeeId.value=data.employee||"";
carNumber.value=data.car||"";
laptopNumber.value=data.laptop||"";
flashCount.value=data.flash||"";
hddCount.value=data.hdd||"";
supervisor.value=data.supervisor||"";

missionStart.value=data.missionStart||"";
missionEnd.value=data.missionEnd||"";
workHours.value=data.workHours||"";

generalNotes.value=data.generalNotes||"";

const rows=document.querySelectorAll("#sitesBody tr");

rows.forEach((row,index)=>{

if(!data.rows[index]) return;

row.querySelector(".xml").value=data.rows[index].xml;

row.querySelector(".status").value=data.rows[index].status;

row.querySelector(".startDate").value=data.rows[index].startDate;

row.querySelector(".startTime").value=data.rows[index].startTime;

row.querySelector(".endDate").value=data.rows[index].endDate;

row.querySelector(".endTime").value=data.rows[index].endTime;

row.querySelector(".duration").value=data.rows[index].duration;

row.querySelector(".notes").value=data.rows[index].notes;

});

updateProgress();

}//======================================
// إنهاء المهمة
//======================================

function finishMission(){

const now=new Date();

missionEnd.value=formatDate(now);

const start=parseMissionDate(missionStart.value);

const diff=now-start;

const totalMinutes=Math.floor(diff/60000);

const hours=Math.floor(totalMinutes/60);

const minutes=totalMinutes%60;

workHours.value=

hours+" ساعة "+minutes+" دقيقة";

saveMission();

alert("تم إنهاء المهمة بنجاح");

}



//======================================
// حفظ تلقائي
//======================================

setInterval(function(){

saveMission();

},30000);



//======================================
// قبل إغلاق الصفحة
//======================================

window.addEventListener("beforeunload",function(){

saveMission();

});



//======================================
// ربط الأزرار
//======================================

document.getElementById("saveBtn").onclick=function(){

saveMission();

alert("تم الحفظ");

};

document.getElementById("finishBtn").onclick=finishMission;

document.getElementById("printBtn").onclick=function(){

window.print();

};

document.getElementById("copyLinkBtn").onclick=function(){

navigator.clipboard.writeText(window.location.href);

alert("تم نسخ الرابط");

};

document.getElementById("shareBtn").onclick=async function(){

if(navigator.share){

await navigator.share({

title:"المهمة الميدانية",

text:"خطة رقم "+planId,

url:window.location.href

});

}else{

alert("المشاركة غير مدعومة");

}

};

document.getElementById("pdfBtn").onclick=function(){

if(typeof exportPDF==="function"){

exportPDF();

}else{

alert("ميزة PDF ستفعل بعد إنشاء export.js");

}

};

document.getElementById("excelBtn").onclick=function(){

if(typeof exportExcel==="function"){

exportExcel();

}else{

alert("ميزة Excel ستفعل بعد إنشاء export.js");

}

};
