//======================================
// Firebase
//======================================

import { initializeApp }

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

doc,

setDoc,

getDoc,

deleteDoc

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



//======================================
// إعدادات Firebase
//======================================

const firebaseConfig={

apiKey:"",

authDomain:"",

projectId:"",

storageBucket:"",

messagingSenderId:"",

appId:""

};



const app=

initializeApp(firebaseConfig);

const db=

getFirestore(app);//======================================
// رفع المهمة
//======================================

async function uploadMission(

plan,

data

){

await setDoc(

doc(db,

"missions",

String(plan)

),

data

);

}



//======================================
// قراءة المهمة
//======================================

async function downloadMission(plan){

const snap=

await getDoc(

doc(

db,

"missions",

String(plan)

)

);

if(

snap.exists()

){

return snap.data();

}

return null;

}//======================================
// حذف المهمة
//======================================

async function deleteMissionCloud(

plan

){

await deleteDoc(

doc(

db,

"missions",

String(plan)

)

);

}



//======================================
// مزامنة
//======================================

async function syncMission(

plan

){

const local=

loadMission(plan);

if(local){

await uploadMission(

plan,

local

);

}

}//======================================
// مزامنة تلقائية
//======================================

window.addEventListener(

"online",

function(){

if(

typeof currentPlan!="undefined"

){

syncMission(currentPlan);

}

});



//======================================
// النهاية
//======================================
