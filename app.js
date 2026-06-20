const plans = {
  4: {
    route: "مسار عنيزة والمذنب",
    sites: [
      "BRDIT169",
      "QSMSM050",
      "QSMSM051"
    ]
  }
};

function searchPlan() {

  const plan = document.getElementById("planNumber").value;
  const table = document.getElementById("sitesTable");

  table.innerHTML = "";

  if (!plans[plan]) {
    document.getElementById("routeName").value = "";
    alert("رقم الخطة غير موجود");
    return;
  }

  document.getElementById("routeName").value = plans[plan].route;

  let html = `
  <table border="1" style="width:100%;border-collapse:collapse;text-align:center">
  <tr>
      <th>رمز الموقع</th>
      <th>XML</th>
      <th>حالة الموقع</th>
      <th>من</th>
      <th>إلى</th>
      <th>صورة العطل</th>
      <th>ملاحظات</th>
  </tr>
  `;

  plans[plan].sites.forEach(site => {

    html += `
    <tr>

      <td>${site}</td>

      <td>
        <select>
          <option>نعم</option>
          <option>لا</option>
        </select>
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
        <input type="file" accept="image/*">
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
