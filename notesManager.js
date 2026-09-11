// ZMOBWORK Notes Manager
window.NotesManager={
 key:'zmob_notes',
 load(){try{return JSON.parse(localStorage.getItem(this.key)||'[]')}catch(e){return []}},
 save(items){localStorage.setItem(this.key,JSON.stringify(items))},
 add(text,priority=false){const items=this.load();items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),text,priority,time:new Date().toISOString()});this.save(items);return items},
 toggle(id){const items=this.load();const item=items.find(x=>String(x.id||x.time)===String(id));if(item)item.priority=!item.priority;this.save(items);return items},
 recent(){return this.load().slice().sort((a,b)=>new Date(b.time||0)-new Date(a.time||0)).slice(0,5)}
};
