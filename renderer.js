const $=id=>document.getElementById(id);
let repairs=JSON.parse(localStorage.getItem('zmob_repairs')||'[]');
let notes=JSON.parse(localStorage.getItem('zmob_notes')||'[]');
let nextCode=Number(localStorage.getItem('zmob_next')||1000);
let problemType='hardware';
const statusText={repair:'در حال تعمیر',done:'تعمیر شده',ready:'آماده تحویل',delivered:'تحویل شده'};
function save(){localStorage.setItem('zmob_repairs',JSON.stringify(repairs));localStorage.setItem('zmob_notes',JSON.stringify(notes));localStorage.setItem('zmob_next',nextCode);}
function money(n){return Number(n||0).toLocaleString('fa-IR')+' تومان'}
function updateStats(){
 $('repairCount').textContent=repairs.filter(x=>x.status==='repair').length;
 $('doneCount').textContent=repairs.filter(x=>x.status==='done').length;
 $('readyCount').textContent=repairs.filter(x=>x.status==='ready').length;
 $('customerCount').textContent=new Set(repairs.map(x=>x.phone)).size;
 const n=repairs.filter(x=>(x.followups||0)>0&&x.status!=='delivered').length;
 $('attentionCount').textContent=n+' مورد';
}
function row(x){return `<div class="row"><b>#${x.code}</b><span>${x.name}</span><span>${x.model}</span><span>${x.problem}</span><span class="badge ${x.status}">${statusText[x.status]}</span><span>›</span></div>`}
function renderRecent(){ $('recent').innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.slice(-7).reverse().map(row).join('') }
function renderLists(){
 const render=(id,status)=>$(id).innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.filter(x=>x.status===status).map(row).join('');
 render('repairList','repair'); render('doneList','done'); render('deliveredList','delivered');
 $('customerList').innerHTML='<div class="row head"><span>کد</span><span>نام</span><span>شماره</span><span>تعداد تعمیر</span><span></span><span></span></div>'+[...new Map(repairs.map(x=>[x.phone,x])).values()].map(x=>`<div class="row"><b>#${x.code}</b><span>${x.name}</span><span>${x.phone}</span><span>${repairs.filter(y=>y.phone===x.phone).length}</span><span></span><span></span></div>`).join('');
}
function renderNotes(){ $('notes').innerHTML=notes.slice(-5).reverse().map((n,i)=>`<div class="note">${n}<small> ✓</small></div>`).join('') }
function go(view){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+view).classList.remove('hidden');document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view!=='new'){renderRecent();renderLists();updateStats()}}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.view));
$('newBtn').onclick=()=>go('new'); $('allRepairs').onclick=()=>go('repair');
document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');problemType=b.dataset.type});
$('saveRepair').onclick=()=>{
 const name=$('name').value.trim(),phone=$('phone').value.trim(),model=$('model').value.trim();
 if(!name||!phone||!model){alert('نام، شماره تماس و مدل را وارد کنید.');return}
 const r={code:nextCode++,name,phone,brand:$('brand').value,model,problem:problemType==='software'?'نرم‌افزار':problemType==='both'?'هر دو':'سخت‌افزار',password:$('password').value,agreed:$('agreed').value,description:$('description').value,status:'repair',followups:0,created:new Date().toISOString()};
 repairs.push(r);save();alert('گوشی با کد '+r.code+' ثبت شد.');clearForm();go('home');
};
function clearForm(){$('name').value='';$('phone').value='';$('model').value='';$('password').value='';$('agreed').value='';$('description').value='';$('ticketNo').textContent=nextCode;}
$('clearForm').onclick=clearForm;
$('saveNote').onclick=()=>{const v=$('noteInput').value.trim();if(!v)return;notes.push(v);$('noteInput').value='';save();renderNotes()};
$('repairSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();$('repairList').innerHTML='<div class="row head"><span>#</span><span>مشتری</span><span>مدل</span><span>مشکل</span><span>وضعیت</span><span></span></div>'+repairs.filter(x=>x.status==='repair'&&JSON.stringify(x).toLowerCase().includes(q)).map(row).join('')};
$('globalSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();if(!q){go('home');return}go('repair');$('repairSearch').value=q;$('repairSearch').dispatchEvent(new Event('input'))};
window.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();go('new')}if(e.ctrlKey&&e.key.toLowerCase()==='k'){e.preventDefault();$('globalSearch').focus()}});
function clock(){const d=new Date();$('clock').textContent=d.toLocaleDateString('fa-IR')+'  •  '+d.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});}
setInterval(clock,1000);clock();clearForm();renderRecent();renderLists();renderNotes();updateStats();
