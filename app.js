const plans = {
  4: {
    route: "مسار 4"
  }
};

function searchPlan() {

  const plan = document.getElementById("planNumber").value;

  if (plans[plan]) {

    document.getElementById("routeName").value =
      plans[plan].route;

  } else {

    alert("رقم الخطة غير موجود");

    document.getElementById("routeName").value = "";
  }

}
