document.addEventListener("DOMContentLoaded", () => {
    
    // تعريف الشاشات الرئيسية وثانيتين الترحيب التلقائي
    const welcomeScreen = document.getElementById('welcome-screen');
    const planManagerScreen = document.getElementById('plan-manager-screen');
    const tableDashboardScreen = document.getElementById('table-dashboard-screen');

    // الاختفاء التلقائي للترحيب بعد ثانيتين
    setTimeout(() => {
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.visibility = 'hidden';
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            planManagerScreen.classList.remove('hidden');
        }, 500);
    }, 2000);

    // قاعدة بيانات الخطط التجريبية لتوزيع المسارات
    const plansDB = {
        "1": "المسار: عنيزة والمذنب",
        "2": "المسار: بريدة والرس",
        "3": "المسار: غرف التحكم المركزية والمبنى الرئيسي"
    };

    // عناصر صندوق البحث وعرض المسار
    const planInput = document.getElementById('plan-input');
    const searchBtn = document.getElementById('search-btn');
    const errorMsg = document.getElementById('error-msg');
    const routeOptionsArea = document.getElementById('route-options-area');
    const dynamicRouteName = document.getElementById('dynamic-route-name');

    // أزرار التحكم الثلاثة والعودة
    const startRouteBtn = document.getElementById('start-route-btn');
    const logsRouteBtn = document.getElementById('logs-route-btn');
    const backRouteBtn = document.getElementById('back-route-btn');
    const exitToManager = document.getElementById('exit-to-manager');

    // 1. حدث الضغط على زر البحث
    searchBtn.addEventListener('click', () => {
        const inputVal = planInput.value.trim();

        if (plansDB[inputVal]) {
            // الخطة موجودة بالنظام
            errorMsg.classList.add('hidden');
            dynamicRouteName.innerText = plansDB[inputVal];
            routeOptionsArea.classList.remove('hidden'); // عرض اسم المسار والأزرار الثلاثة
        } else {
            // الخطة غير موجودة
            routeOptionsArea.classList.add('hidden');
            errorMsg.classList.remove('hidden');
        }
    });

    // 2. حدث الضغط على "بدء المسار" (ينقلك للجدول)
    startRouteBtn.addEventListener('click', () => {
        planManagerScreen.classList.add('hidden');
        tableDashboardScreen.classList.remove('hidden');
    });

    // 3. حدث الضغط على "سجلات المسار السابقة"
    logsRouteBtn.addEventListener('click', () => {
        alert('📜 جاري تحميل سجلات الجولات السابقة لهذا المسار من النظام...');
    });

    // 4. حدث الضغط على "رجوع للخلف" (يمسح المدخلات ويعيد التهيأة للبحث الجديد)
    backRouteBtn.addEventListener('click', () => {
        resetManagerForm();
    });

    // زر الخروج المؤقت الملحق بالجدول للعودة لشاشة التحكم
    exitToManager.addEventListener('click', () => {
        tableDashboardScreen.classList.add('hidden');
        planManagerScreen.classList.remove('hidden');
    });

    function resetManagerForm() {
        planInput.value = "";
        routeOptionsArea.classList.add('hidden');
        errorMsg.classList.add('hidden');
    }
});
