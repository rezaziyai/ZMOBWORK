// ZMOBWORK Notes UI
window.NotesUI={
 render(){
  const box=document.getElementById('notes');
  if(!box)return;
  const items=window.NotesManager?NotesManager.recent():[];
  box.innerHTML=items.map((n,i)=>`<div class="note"><span>${n.priority?'⭐ ':''}${String(n.text).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}</span><button class="note-star" data-note="${n.id||n.time}">${n.priority?'★':'☆'}</button></div>`).join('');
  box.querySelectorAll('.note-star').forEach(btn=>btn.onclick=()=>{NotesManager.toggle(btn.dataset.note);this.render();});
 },
 add(text){
  if(window.NotesManager) NotesManager.add(text);
  this.render();
 }
};
