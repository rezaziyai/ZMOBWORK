const $=id=>document.getElementById(id);
let repairs=JSON.parse(localStorage.getItem('zmob_repairs')||'[]');
let notes=JSON.parse(localStorage.getItem('zmob_notes')||'[]');
let nextCode=Number(localStorage.getItem('zmob_next')||1000);
let problemType='hardware';
const statusText={repair:'در حال تعمیر',done:'تعمیر شده',ready:'آماده تحویل',delivered:'تحویل شده'};
const catalog={
  Samsung:['Galaxy S26 Ultra','Galaxy S26+','Galaxy S26','Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy S23+','Galaxy S23','Galaxy S22 Ultra','Galaxy S22+','Galaxy S22','Galaxy S21 Ultra','Galaxy S21+','Galaxy S21','Galaxy S20 FE','Galaxy S20','Galaxy S10+','Galaxy S10','Galaxy S9+','Galaxy S9','Galaxy Note 20 Ultra','Galaxy Note 20','Galaxy Note 10+','Galaxy Note 10','Galaxy A56 5G','Galaxy A55 5G','Galaxy A54 5G','Galaxy A53 5G','Galaxy A52s 5G','Galaxy A52','Galaxy A51','Galaxy A50','Galaxy A35 5G','Galaxy A34 5G','Galaxy A33 5G','Galaxy A32','Galaxy A31','Galaxy A30','Galaxy A25 5G','Galaxy A24','Galaxy A23','Galaxy A22','Galaxy A21s','Galaxy A20','Galaxy A15','Galaxy A14','Galaxy A13','Galaxy A12','Galaxy A11','Galaxy A10','Galaxy A05s','Galaxy A05','Galaxy M55 5G','Galaxy M54 5G','Galaxy M53 5G','Galaxy M52 5G','Galaxy M51','Galaxy M34 5G','Galaxy M33 5G','Galaxy M32','Galaxy M31','Galaxy M30s','Galaxy M21','Galaxy M12','Galaxy M11','Galaxy F54 5G','Galaxy F34 5G','Galaxy F23 5G','Galaxy F22','Galaxy F12'],
  Apple:['iPhone 17 Pro Max','iPhone 17 Pro','iPhone 17 Plus','iPhone 17','iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 16e','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 13 mini','iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12','iPhone 12 mini','iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11','iPhone XS Max','iPhone XS','iPhone XR','iPhone X','iPhone 8 Plus','iPhone 8','iPhone 7 Plus','iPhone 7','iPhone 6s Plus','iPhone 6s','iPhone 6 Plus','iPhone 6','iPhone SE (2022)','iPhone SE (2020)','iPhone SE (2016)'],
  Xiaomi:['Xiaomi 15 Ultra','Xiaomi 15','Xiaomi 14 Ultra','Xiaomi 14','Xiaomi 13 Pro','Xiaomi 13','Xiaomi 12 Pro','Xiaomi 12','Xiaomi 11T Pro','Xiaomi 11T','Xiaomi 11 Lite','Xiaomi Mi 11','Xiaomi Mi 10T Pro','Xiaomi Mi 10','Xiaomi Mi 9','Xiaomi Mi 8','Xiaomi Redmi Note 14 Pro+','Xiaomi Redmi Note 14 Pro','Xiaomi Redmi Note 14','Xiaomi Redmi Note 13 Pro+','Xiaomi Redmi Note 13 Pro','Xiaomi Redmi Note 13','Xiaomi Redmi Note 12 Pro+','Xiaomi Redmi Note 12 Pro','Xiaomi Redmi Note 12','Xiaomi Redmi Note 11 Pro','Xiaomi Redmi Note 11','Xiaomi Redmi Note 10 Pro','Xiaomi Redmi Note 10','Xiaomi Redmi 12','Xiaomi Redmi 10','Xiaomi Redmi 9'],
  POCO:['POCO F7 Pro','POCO F7','POCO F6 Pro','POCO F6','POCO F5 Pro','POCO F5','POCO F4','POCO F3','POCO X7 Pro','POCO X7','POCO X6 Pro','POCO X6','POCO X5 Pro','POCO X5','POCO X4 Pro 5G','POCO X3 Pro','POCO X3 NFC','POCO M7 Pro 5G','POCO M6 Pro','POCO M5','POCO M4 Pro 5G','POCO M3','POCO C75','POCO C65','POCO C55'],
  Redmi:['Redmi Note 14 Pro+ 5G','Redmi Note 14 Pro 5G','Redmi Note 14 5G','Redmi Note 14','Redmi Note 13 Pro+ 5G','Redmi Note 13 Pro 5G','Redmi Note 13 Pro','Redmi Note 13 5G','Redmi Note 13','Redmi Note 12 Pro+ 5G','Redmi Note 12 Pro 5G','Redmi Note 12 Pro','Redmi Note 12 5G','Redmi Note 12','Redmi Note 11 Pro+ 5G','Redmi Note 11 Pro 5G','Redmi Note 11 Pro','Redmi Note 11S','Redmi Note 11','Redmi Note 10 Pro','Redmi Note 10','Redmi Note 9 Pro','Redmi Note 9S','Redmi Note 9','Redmi 13C','Redmi 13','Redmi 12C','Redmi 12','Redmi 10','Redmi 9T','Redmi 9','Redmi 8','Redmi 7','Redmi 6'],
  Huawei:['Pura 70 Ultra','P60 Pro','P50 Pro','P40 Pro','P30 Pro','P30','P20 Pro','P20','Mate 50 Pro','Mate 40 Pro','Mate 30 Pro','Mate 20 Pro','Mate 10 Pro','Nova 12i','Nova 11 Pro','Nova 10 Pro','Nova 9','Nova 8i','Nova 7i','Nova 5T','Y9a','Y9 Prime 2019','Y9 2019','Y7a','Y7 Prime','Y6p','Y6 2019','Y5 2019'],
  Honor:['Magic7 Pro','Magic6 Pro','Magic5 Pro','Magic4 Pro','Magic V2','Honor 200 Pro','Honor 200','Honor 90','Honor 90 Lite','Honor 70','Honor 50','X9b','X9a','X8b','X8a','X7b','X7a','X6a','X5 Plus','X5','90 Lite'],
  Realme:['GT 7 Pro','GT 6','GT 5 Pro','GT Neo 6','GT Neo 5','GT 2 Pro','GT 2','12 Pro+ 5G','12 Pro 5G','11 Pro+ 5G','11 Pro 5G','10 Pro+','10 Pro','9 Pro+','9 Pro','8 Pro','8','7 Pro','7','6 Pro','C75','C67','C55','C53','C35','C33','C25'],
  Oppo:['Find X8 Pro','Find X7 Ultra','Find X6 Pro','Find X5 Pro','Find X3 Pro','Reno 13 Pro','Reno 12 Pro','Reno 11 Pro','Reno 10 Pro+','Reno 8 Pro','Reno 7','A98','A78','A58','A57','A54','A16','A15','A5'],
  Vivo:['X200 Pro','X100 Pro','X90 Pro','X80 Pro','X70 Pro','V40 Pro','V30 Pro','V29','V27','V25','V23','V21','Y200','Y100','Y78','Y36','Y35','Y22','Y21','Y20','Y19'],
  OnePlus:['OnePlus 13','OnePlus 12','OnePlus 11','OnePlus 10 Pro','OnePlus 9 Pro','OnePlus 9','OnePlus 8T','OnePlus 8 Pro','OnePlus Nord 4','OnePlus Nord 3','OnePlus Nord 2','OnePlus Nord CE 4','OnePlus Nord CE 3'],
  Motorola:['Edge 60 Pro','Edge 50 Pro','Edge 50 Fusion','Edge 40 Pro','Edge 40','Edge 30 Ultra','Moto G85','Moto G84','Moto G73','Moto G54','Moto G53','Moto G52','Moto G42','Moto G32','Moto G22','Moto G20'],
  Nokia:['Nokia G42 5G','Nokia G60 5G','Nokia G50','Nokia X30 5G','Nokia X20','Nokia X10','Nokia 8.3','Nokia 7.2','Nokia 6.2','Nokia 5.4','Nokia 3.4','Nokia 2.4'],
  Tecno:['Camon 40 Pro','Camon 30 Pro','Camon 30','Camon 20 Pro','Camon 20','Spark 30 Pro','Spark 20 Pro','Spark 20','Spark 10 Pro','Pova 6 Pro','Pova 5 Pro','Pova 5'],
  Infinix:['Note 50 Pro+','Note 40 Pro+','Note 40 Pro','Note 30 Pro','Note 30','Hot 50 Pro+','Hot 40 Pro','Hot 40','Hot 30','Zero 40','Zero 30','GT 20 Pro','GT 10 Pro'],
  Sony:['Xperia 1 VI','Xperia 1 V','Xperia 1 IV','Xperia 5 V','Xperia 5 IV','Xperia 10 VI','Xperia 10 V','Xperia 10 IV','Xperia 10 III'],
  Google:['Pixel 10 Pro XL','Pixel 10 Pro','Pixel 10','Pixel 9 Pro XL','Pixel 9 Pro','Pixel 9','Pixel 8 Pro','Pixel 8','Pixel 7 Pro','Pixel 7','Pixel 6 Pro','Pixel 6','Pixel 5'],
  Asus:['ROG Phone 9 Pro','ROG Phone 8 Pro','ROG Phone 7','Zenfone 11 Ultra','Zenfone 10','Zenfone 9'],
  'سایر':['مدل متفرقه / ورود دستی']
};
const extraCatalog={
Samsung:['Galaxy A73 5G','Galaxy A72','Galaxy A71','Galaxy A70','Galaxy A52 5G','Galaxy A52 4G','Galaxy A42 5G','Galaxy A41','Galaxy A40','Galaxy A22 5G','Galaxy A22 4G','Galaxy A21','Galaxy A20s','Galaxy A10s','Galaxy A03s','Galaxy A02s','Galaxy A01','Galaxy J7 Prime','Galaxy J7 Pro','Galaxy J7','Galaxy J5 Prime','Galaxy J5','Galaxy J3','Galaxy Grand Prime','Galaxy Grand 2','Galaxy Note 9','Galaxy Note 8','Galaxy Note 5','Galaxy Note 4','Galaxy Note 3','Galaxy S8+','Galaxy S8','Galaxy S7 Edge','Galaxy S7','Galaxy S6 Edge+','Galaxy S6 Edge','Galaxy S6'],
Apple:['iPhone 17 Air','iPhone 15','iPhone 14','iPhone SE 3','iPhone SE 2','iPhone 13 mini','iPhone 12 mini','iPhone XS','iPhone 8','iPhone 7','iPhone 6s','iPhone 5s'],
Xiaomi:['Xiaomi 15 Pro','Xiaomi 14T Pro','Xiaomi 14T','Xiaomi 13T Pro','Xiaomi 13T','Xiaomi 12T Pro','Xiaomi 12T','Xiaomi 11T','Mi 11 Ultra','Mi 11 Lite 5G','Mi 10T','Mi 10T Lite','Mi 10 Lite','Mi 9T Pro','Mi 9T','Mi 9 Lite','Mi 8 Lite','Mi A3','Mi A2','Mi A2 Lite','Mi A1'],
POCO:['POCO F7 Ultra','POCO F7','POCO F6','POCO F5','POCO F4 GT','POCO F3 GT','POCO X7','POCO X6','POCO X5','POCO X4 GT','POCO X3 GT','POCO X3 NFC','POCO X2','POCO M7','POCO M6','POCO M5s','POCO M4 Pro','POCO M3 Pro 5G','POCO M2 Pro','POCO M2','POCO C40','POCO C31'],
Redmi:['Redmi Note 14 Pro+','Redmi Note 14 Pro','Redmi Note 14','Redmi Note 13 Pro+','Redmi Note 13 Pro','Redmi Note 13','Redmi Note 12S','Redmi Note 11 Pro+','Redmi Note 10S','Redmi Note 10 5G','Redmi Note 9T','Redmi Note 8 Pro','Redmi Note 8','Redmi Note 7','Redmi 13C 5G','Redmi 13C','Redmi 12 5G','Redmi 11 Prime','Redmi 10C','Redmi 9A','Redmi 9C','Redmi 9AT','Redmi 8A','Redmi 7A','Redmi 6A','Redmi 5 Plus','Redmi 5A','Redmi 4X'],
Huawei:['Mate X3','Mate X2','Mate 50','Mate 40','Mate 30','Mate 20','Mate 10','Pura 70 Pro','Pura 70','P60','P50','P40','P30 Lite','P20 Lite','P10 Plus','P10','Nova 12','Nova 11','Nova 10','Nova 9 SE','Nova 8','Nova 7','Nova 6','Y9 Prime 2019','Y9s','Y8p','Y8s','Y7p','Y6s','Y6 2018','Y5p'],
Honor:['Magic7 RSR','Magic6 RSR','Magic V3','Magic V2 RSR','Magic Vs','Magic Vs2','Magic4 Lite','Honor 200 Lite','Honor 100 Pro','Honor 100','Honor 90 Pro','Honor 90 Smart','Honor 80 Pro','Honor 80','Honor 70 Lite','Honor 50 Lite','X9c','X9b','X8c','X8','X7c','X7','X6b','X6','X5b','X5 Plus','Play 8T','Play 7T'],
Oppo:['Find X8','Find X7','Find X5','Find X3','Find X2 Pro','Reno 13','Reno 12','Reno 11','Reno 10','Reno 8T','Reno 7Z','Reno 6','Reno 5','Reno 4','A98 5G','A96','A95','A94','A92','A91','A74','A73','A57 4G','A53','A52','A31','A16K'],
Vivo:['X200','X100','X90','X80','X70','X60','X50','X30','V40','V30','V29e','V27e','V25e','V23e','V21e','V20','V19','Y200e','Y100i','Y36 5G','Y35 5G','Y33s','Y31','Y30','Y20s','Y17','Y15','Y12','Y11'],
Realme:['GT 7','GT 6T','GT 5','GT Neo 6 SE','GT Neo 5 SE','GT 3','GT 2 Master','12 Pro','12+ 5G','11 Pro','11','10','9i','9 5G','8i','8 5G','7i','6i','C75x','C65','C55 NFC','C35','C25Y','C21','C20'],
Motorola:['Edge 60 Fusion','Edge 60','Edge 50 Ultra','Edge 50 Neo','Edge 30 Pro','Edge 30 Fusion','Edge 30 Neo','Moto G75','Moto G55','Moto G45','Moto G35','Moto G24','Moto G23','Moto G22','Moto G20','Moto E40','Moto E32','Moto E22','Moto E20'],
Nokia:['Nokia 6310','Nokia 2660 Flip','Nokia 8210 4G','Nokia 3310 4G','Nokia C32','Nokia C31','Nokia C22','Nokia C21 Plus','Nokia 5.3','Nokia 4.2','Nokia 3.2','Nokia 2.3','Nokia 1.4'],
Tecno:['Phantom V Fold2','Phantom V Flip2','Phantom X2 Pro','Phantom X2','Camon 40','Camon 30 Premier','Camon 20 Premier','Camon 19 Pro','Camon 18 Premier','Spark 30','Spark 20C','Spark 10','Spark 9','Spark 8','Pova 6','Pova 6 Neo','Pova 4','Pova 3','Pova 2'],
Infinix:['Note 50 Pro','Note 50','Note 40','Note 30 VIP','Note 30 Pro','Note 12 Pro','Note 11 Pro','Hot 50','Hot 50i','Hot 40i','Hot 30i','Hot 20','Hot 12','Hot 11','Zero 40','Zero 30 5G','Zero 20','Zero X Pro','GT 30 Pro','GT 20 Pro'],
Sony:['Xperia 1 VII','Xperia 1 V','Xperia 1 III','Xperia 5 II','Xperia 5 III','Xperia 5 IV','Xperia 10 II','Xperia 10 III','Xperia 10 IV','Xperia 10 V','Xperia L4','Xperia L3'],
Google:['Pixel 10 Pro Fold','Pixel 9 Pro Fold','Pixel 8a','Pixel 7a','Pixel 6a','Pixel 5a','Pixel 4a','Pixel 4 XL','Pixel 4','Pixel 3a XL','Pixel 3a','Pixel 3 XL','Pixel 3'],
Asus:['ROG Phone 9','ROG Phone 8','ROG Phone 7 Ultimate','ROG Phone 6','ROG Phone 5','Zenfone 11','Zenfone 10','Zenfone 9','Zenfone 8','Zenfone 7 Pro','Zenfone 6']
};
Object.keys(extraCatalog).forEach(b=>{catalog[b]=[...new Set([...(catalog[b]||[]),...extraCatalog[b]])]});
function initCatalog(){
 const brand=$('brand'); brand.innerHTML=''; Object.keys(catalog).forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent=b;brand.appendChild(o)});
 brand.onchange=()=>fillModels(brand.value); fillModels(brand.value);
}
function fillModels(brand){
 const list=$("modelList"); if(!list)return; list.innerHTML='';
 (catalog[brand]||[]).forEach(m=>{const o=document.createElement('option');o.value=m;list.appendChild(o);});
}
function save(){localStorage.setItem('zmob_repairs',JSON.stringify(repairs));localStorage.setItem('zmob_notes',JSON.stringify(notes));localStorage.setItem('zmob_next',nextCode)}
function money(n){return Number(n||0).toLocaleString('fa-IR')+' تومان'}
function updateStats(){
 $('repairCount').textContent=repairs.filter(x=>x.status==='repair').length;
 $('doneCount').textContent=repairs.filter(x=>x.status==='done').length;
 $('readyCount').textContent=repairs.filter(x=>x.status==='ready').length;
 $('customerCount').textContent=new Set(repairs.map(x=>x.phone)).size;
 const n=repairs.filter(x=>(x.followups||0)>0&&x.status!=='delivered').length; $('attentionCount').textContent=n+' مورد';
}
function row(x){const order=['repair','done','delivered'];const i=order.indexOf(x.status);const next=order[i+1],prev=order[i-1];const action=next?statusText[next]:'';return `<div class="row"><b>#${x.code}</b><span>${x.name}</span><span>${x.brand} • ${x.model}</span><span>${x.problem}</span><span class="badge ${x.status}">${statusText[x.status]}</span><span class="row-actions">${prev?`<button class="row-action back" title="بازگشت" data-code="${x.code}" data-next="${prev}">‹</button>`:''}${next?`<button class="row-action" data-code="${x.code}" data-next="${next}">${action}</button>`:'✓'}</span></div>`}
function renderRecent(){ $('recent').innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.slice(-7).reverse().map(row).join('') }
function renderLists(){
 const render=(id,status)=>$(id).innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.filter(x=>x.status===status).map(row).join('');
 render('repairList','repair'); $('doneList').innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.filter(x=>x.status==='done').map(row).join(''); render('deliveredList','delivered');
 $('customerList').innerHTML='<div class="row head"><span>کد</span><span>نام</span><span>شماره</span><span>تعداد تعمیر</span><span></span><span></span></div>'+[...new Map(repairs.map(x=>[x.phone,x])).values()].map(x=>`<div class="row"><b>#${x.code}</b><span>${x.name}</span><span>${x.phone}</span><span>${repairs.filter(y=>y.phone===x.phone).length}</span><span></span><span></span></div>`).join('');
}
function renderNotes(){ $('notes').innerHTML=notes.slice(-5).reverse().map(n=>`<div class="note">${n}<small> ✓</small></div>`).join('') }
function go(view){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+view).classList.remove('hidden');document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view!=='new'){renderRecent();renderLists();updateStats()}}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.view)); $('newBtn').onclick=()=>go('new'); $('allRepairs').onclick=()=>go('repair');
document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');problemType=b.dataset.type});
$('saveRepair').onclick=()=>{
 const name=$('name').value.trim(),phone=$('phone').value.trim(),model=$('model').value.trim();
 if(!name||!phone||!model){alert('نام، شماره تماس و مدل را وارد کنید.');return}
 const agreed=parseAmount($('agreed').value); const r={code:nextCode++,name,phone,brand:$('brand').value,model,problem:problemType==='software'?'نرم‌افزار':problemType==='both'?'هر دو':'سخت‌افزار',password:$('password').value,agreed,description:$('description').value,status:'repair',followups:0,created:new Date().toISOString()};
 repairs.push(r);save();alert('گوشی با کد '+r.code+' ثبت شد.');clearForm();go('home');
};
function clearForm(){$('name').value='';$('phone').value='';$('password').value='';$('agreed').value='';$('description').value='';$('ticketNo').textContent=nextCode;fillModels($('brand').value);updateAmountHint()}
$('clearForm').onclick=clearForm;
$('phone').oninput=()=>{const phone=$('phone').value.trim();const old=repairs.slice().reverse().find(x=>x.phone===phone);const hint=$('customerHint');if(old){if(!$('name').value.trim())$('name').value=old.name;hint.textContent='مشتری قبلی: '+old.name+' • '+repairs.filter(x=>x.phone===phone).length+' تعمیر';}else hint.textContent=''};
document.querySelectorAll('.quick-amounts button').forEach(b=>b.onclick=()=>{const v=Number(b.dataset.amount);$('agreed').value=v.toLocaleString('en-US');updateAmountHint()});
function parseAmount(v){v=String(v||'').replace(/,/g,'').trim();if(!v||Number(v)===0)return null;const n=Number(v);if(!Number.isFinite(n)||n<0)return null;return n<1000&&v.includes('.')?Math.round(n*1000000):n<1000?Math.round(n*1000):Math.round(n)}
function updateAmountHint(){const raw=$('agreed').value;const n=parseAmount(raw);$('amountHint').textContent=n===null?'هزینه هنوز هماهنگ نشده':'مبلغ: '+n.toLocaleString('fa-IR')+' تومان'}
$('agreed').addEventListener('input',updateAmountHint);$('agreed').addEventListener('blur',()=>{const n=parseAmount($('agreed').value);$('agreed').value=n===null?'':n.toLocaleString('en-US');updateAmountHint()});
document.querySelectorAll('.quick-issues button').forEach(b=>b.onclick=()=>{const d=$('description');const v=b.dataset.issue;if(!d.value.trim())d.value=v;else if(!d.value.includes(v))d.value+='، '+v;d.focus()});

$('saveNote').onclick=()=>{const v=$('noteInput').value.trim();if(!v)return;notes.push(v);$('noteInput').value='';save();renderNotes()};
document.addEventListener('click',e=>{const b=e.target.closest('.row-action');if(!b)return;const r=repairs.find(x=>String(x.code)===b.dataset.code);if(!r)return;r.status=b.dataset.next;save();renderRecent();renderLists();updateStats();});
$('repairSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();$('repairList').innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.filter(x=>x.status==='repair'&&JSON.stringify(x).toLowerCase().includes(q)).map(row).join('')};
$('globalSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();if(!q){go('home');return}go('repair');$('repairSearch').value=q;$('repairSearch').dispatchEvent(new Event('input'))};
window.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'&&!$('view-new').classList.contains('hidden')){$('saveRepair').click();return}if(e.key==='F2'){e.preventDefault();go('new')}if(e.ctrlKey&&e.key.toLowerCase()==='k'){e.preventDefault();$('globalSearch').focus()}});
function clock(){const d=new Date();$('clock').textContent=d.toLocaleDateString('fa-IR')+'  •  '+d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});}
setInterval(clock,1000);clock();initCatalog();clearForm();renderRecent();renderLists();renderNotes();updateStats();