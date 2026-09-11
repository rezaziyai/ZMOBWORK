// ZMOBWORK customer follow-up helper
window.FollowupManager={
 find(text){
  if(!window.repairs)return [];
  const q=String(text||'').trim().toLowerCase();
  return repairs.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
 },
 checkNote(text){
  const matches=this.find(text);
  return {found:matches.length>0,count:matches.length,items:matches};
 }
};
