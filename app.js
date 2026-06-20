function startPlan() {
  const plan = document.getElementById("planNumber").value;

  if (plan === "") {
    alert("الرجاء إدخال رقم الخطة");
    return;
  }

  alert("تم إدخال رقم الخطة: " + plan);
}
