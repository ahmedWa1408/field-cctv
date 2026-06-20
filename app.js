function startPlan() {
  const plan = document.getElementById("planNumber").value;

  if (plan === "") {
    alert("الرجاء إدخال رقم الخطة");
    return;
  }

  localStorage.setItem("planNumber", plan);

  alert("تم حفظ رقم الخطة: " + plan);
}
