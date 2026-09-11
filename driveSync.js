window.DriveSync={
  timer:null,
  connected:false,
  statusText:'اتصال برقرار نیست',
  init:async function(){
    if(!window.zmob)return;
    const s=await window.zmob.driveStatus(); this.connected=!!s.connected;
    this.updateUI();
    if(this.connected) this.sync(false);
  },
  payload:function(){
    return {schema:1,app:'ZMOBWORK',changedAt:localStorage.getItem('zmob_data_changed_at')||new Date().toISOString(),
      repairs:JSON.parse(localStorage.getItem('zmob_repairs')||'[]'),notes:JSON.parse(localStorage.getItem('zmob_notes')||'[]'),
      nextCode:localStorage.getItem('zmob_next')||'1000',demoSeeded:localStorage.getItem('zmob_demo_seeded')||'1'};
  },
  markDirty:function(){
    localStorage.setItem('zmob_data_changed_at',new Date().toISOString());
    if(this.timer)clearTimeout(this.timer);
    this.timer=setTimeout(()=>this.sync(false),1800);
  },
  sync:async function(show){
    if(!this.connected||!window.zmob)return;
    this.statusText='در حال همگام‌سازی…'; this.updateUI();
    const result=await window.zmob.driveSync(this.payload());
    if(!result.ok){this.statusText='خطا: '+result.error;this.updateUI();if(show)alert(result.error);return;}
    if(result.mode==='downloaded'&&result.data){
      const d=result.data;
      localStorage.setItem('zmob_repairs',JSON.stringify(d.repairs||[]));localStorage.setItem('zmob_notes',JSON.stringify(d.notes||[]));
      localStorage.setItem('zmob_next',String(d.nextCode||1000));localStorage.setItem('zmob_demo_seeded',String(d.demoSeeded||'1'));localStorage.setItem('zmob_data_changed_at',d.changedAt||new Date().toISOString());
      this.statusText='اطلاعات از Google Drive دریافت شد';this.updateUI();location.reload();return;
    }
    this.statusText=result.mode==='uploaded'?'آخرین تغییرات در Drive ذخیره شد':'همگام است';this.updateUI();
    localStorage.setItem('zmob_last_backup',new Date().toISOString());
  },
  connect:async function(){
    const id=(document.getElementById('googleClientId')?.value||'').trim();
    const secret=(document.getElementById('googleClientSecret')?.value||'').trim();
    if(!id){alert('Client ID گوگل را وارد کن.');return;}
    this.statusText='در حال ورود به Google…';this.updateUI();
    const r=await window.zmob.driveAuth(id,secret);
    if(!r.ok){this.statusText='اتصال ناموفق: '+r.error;this.updateUI();alert(r.error);return;}
    this.connected=true;this.statusText='اتصال برقرار شد';this.updateUI();this.sync(true);
  },
  disconnect:async function(){await window.zmob.driveSignout();this.connected=false;this.statusText='اتصال قطع شد';this.updateUI();},
  updateUI:function(){
    const state=document.getElementById('driveStatus'),last=document.getElementById('driveLastBackup'),btn=document.getElementById('driveConnect');
    if(state)state.textContent=this.connected?'🟢 متصل به Google Drive':'⚪ متصل نیست';
    if(last){const t=localStorage.getItem('zmob_last_backup');last.textContent=t?'آخرین همگام‌سازی: '+new Date(t).toLocaleString('fa-IR'):'هنوز بکاپی ثبت نشده';}
    if(btn)btn.textContent=this.connected?'قطع اتصال':'اتصال به Google Drive';
  }
};
