function startPlan() {
  const plan = document.getElementById("planNumber").value;
  const site = document.getElementById("siteName").value;
  const camera = document.getElementById("cameraName").value;

  if (plan === "" || site === "" || camera === "") {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  const now = new Date();

  document.getElementById("result").innerHTML = `
    <h3>تم حفظ البيانات</h3>
    <p><strong>رقم الخطة:</strong> ${plan}</p>
    <p><strong>الموقع:</strong> ${site}</p>
    <p><strong>الكاميرا:</strong> ${camera}</p>
    <p><strong>التاريخ:</strong> ${now.toLocaleDateString("ar-SA")}</p>
    <p><strong>الوقت:</strong> ${now.toLocaleTimeString("ar-SA")}</p>
  `;
}
