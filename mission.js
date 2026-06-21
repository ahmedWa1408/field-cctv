// =========================
// بيانات الخطة
// =========================

const planNumber = localStorage.getItem("planNumber");
const routeName = localStorage.getItem("routeName");

document.getElementById("routeTitle").textContent =
"الخطة " + planNumber + " | " + routeName;

const table = document.getElementById("sitesTable");

if (plans[planNumber]) {

plans[planNumber].sites.forEach((site,index)=>{

table.innerHTML += `

<tr>

<td>${site.code}</td>

<td>${site.storage}</td>

<td><input type="datetime-local"></td>

<td><input type="datetime-local"></td>

<td><input type="datetime-local"></td>

<td><input type="datetime-local"></td>

<td>

<input
type="number"
placeholder="الساعات">

</td>

<td>

<select>

<option>نعم</option>

<option>لا</option>

</select>

</td>

<td>

<a
href="${site.map}"
target="_blank">

فتح

</a>

</td>

<td>

<select>

<option>يعمل</option>

<option>لا يعمل</option>

<option>لا يوجد مخالفات</option>

</select>

</td>

<td>

<input
type="text"
placeholder="ملاحظات">

</td>

</tr>

`;

});

}// =========================
// حفظ المهمة
// =========================

document.getElementById("saveMission").onclick = function () {

alert("تم حفظ المهمة بنجاح");

};


// =========================
// إنهاء المهمة
// =========================

document.getElementById("finishMission").onclick = function () {

if(confirm("هل تريد إنهاء المهمة؟")){

localStorage.removeItem("planNumber");
localStorage.removeItem("routeName");

window.location.href="index.html";

}

};
