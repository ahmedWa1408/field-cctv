function searchPlan() {

  const plan = document.getElementById("planNumber").value.trim();
  const table = document.getElementById("sitesTable");

  table.innerHTML = "";

  if (!plans[plan]) {

    document.getElementById("routeName").value = "";

    alert("رقم الخطة غير موجود");

    return;

  }

  document.getElementById("routeName").value = plans[plan].route;

  let html = `

<table class="sites-table">

<tr>

<th>رمز الموقع</th>
<th>نوع الوحدة</th>
<th>📍 الموقع</th>
<th>XML</th>
<th>حالة الموقع</th>
<th>من</th>
<th>إلى</th>
<th>📷 صور</th>
<th>ملاحظات</th>

</tr>

`;

  plans[plan].sites.forEach(site => {

    html += `

<tr>

<td>${site.code}</td>

<td>${site.storage}</td>

<td>

<a href="${site.map}" target="_blank">

📍 فتح الموقع

</a>

</td>

<td>

<label><input type="radio" name="xml_${site.code}"> نعم</label>

<label><input type="radio" name="xml_${site.code}"> لا</label>

</td>

<td>

<select>

<option>يعمل</option>

<option>لا يعمل</option>

<option>يعمل ولا توجد مخالفات</option>

</select>

</td>

<td>

<input type="datetime-local">

</td>

<td>

<input type="datetime-local">

</td>

<td>

<input type="file" accept="image/*" multiple>

</td>

<td>

<input type="text">

</td>

</tr>

`;

  });

  html += "</table>";

  table.innerHTML = html;

}
