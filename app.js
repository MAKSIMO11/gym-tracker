const KEY='gymTracker.records.v2';
const routines={
 A:{name:'Full Body A', exercises:[
  ['Fondos en paralelas','fijo · 4×8','body'],['Sentadilla / Hack squat','3×8–10','20–30 kg aprox.'],['Press banca','3×8–12','30–35 kg aprox.'],['Remo sentado / máquina','3×8–12','25–35 kg aprox.'],['Curl femoral','2–3×10–12','15–25 kg aprox.'],['Elevaciones laterales','2–3×10–15','4–6 kg c/u'],['Curl bíceps','2×10–12','8 kg c/u'],['Tríceps en polea','2×10–12','20–25 kg aprox.'] ]},
 B:{name:'Full Body B', exercises:[
  ['Fondos en paralelas','fijo · 4×8','body'],['Prensa de piernas','3×8–12','80 kg base actual'],['Press inclinado mancuernas','3×8–12','8 kg c/u base actual'],['Jalón al pecho','3×8–12','35 kg base actual'],['Peso muerto rumano','2–3×8–10','25 kg · técnica'],['Press de hombros','2–3×8–12','6 kg c/u'],['Curl bíceps','2×8–12','8 kg c/u'],['Tríceps en polea','2×10–12','12 kg base actual'] ]}
};
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateISO(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function fmt(d){return new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00'))}
function newRecord(type){const r=routines[type];return {id:uid(),date:dateISO(),type,created:new Date().toISOString(),notes:'',exercises:r.exercises.map((e,i)=>({name:e[0],target:e[1],base:e[2],sets:Array.from({length:(i===0?4:(e[1].startsWith('2–3')?2:3))},()=>({reps:'',weight:'',rir:'',done:false})),notes:''}))}}
function home(){const records=load().sort((a,b)=>b.date.localeCompare(a.date)||b.created.localeCompare(a.created));document.querySelector('#app').innerHTML=`<div class="wrap"><div class="top"><div><div class="brand">Gym Tracker</div><div class="sub">Registro simple · tus datos quedan en este iPhone</div></div><span class="pill">${records.length} sesiones</span></div><div class="hero"><h1>¿Qué entrenamos?</h1><p>Crea una sesión nueva y anota pesos y repeticiones mientras entrenas.</p><div class="grid" style="margin-top:14px"><button class="btn blue" onclick="create('A')">+ Full Body A</button><button class="btn" onclick="create('B')">+ Full Body B</button></div></div><div class="section-title">Historial</div>${records.length?records.map(r=>`<button class="history-item" onclick="openRecord('${r.id}')"><strong>${r.type==='A'?'Full Body A':'Full Body B'} · ${esc(fmt(r.date))}</strong><span>${r.exercises.filter(e=>e.sets.some(s=>s.done||s.reps||s.weight)).length}/${r.exercises.length} ejercicios con registro</span></button>`).join(''):'<div class="card empty">Todavía no hay sesiones. Empieza con la A o la B.</div>'}<div class="grid" style="margin-top:12px"><button class="btn secondary small" onclick="exportData()">Exportar respaldo</button><button class="btn secondary small" onclick="importData()">Importar respaldo</button></div><div class="footer">Puedes añadir esta web a la pantalla de inicio del iPhone. Funciona también sin conexión una vez cargada.</div></div>`}
function create(type){const r=newRecord(type);const all=load();all.push(r);save(all);openRecord(r.id)}
function openRecord(id){const r=load().find(x=>x.id===id);if(!r)return home();document.querySelector('#app').innerHTML=`<div class="wrap"><div class="top"><button class="btn secondary small" onclick="home()">← Historial</button><span class="pill">${r.type==='A'?'A':'B'}</span></div><div class="hero"><h1>${r.type==='A'?'Full Body A':'Full Body B'}</h1><p>${esc(fmt(r.date))}</p></div><div class="card"><label class="sub">Fecha</label><input class="input" style="margin-top:6px;text-align:left" type="date" value="${r.date}" onchange="updateDate('${r.id}',this.value)"></div><div class="card">${r.exercises.map((e,ei)=>exerciseHTML(r,ei,e)).join('')}</div><div class="card"><label class="sub">Notas de la sesión</label><textarea class="input" onchange="updateNote('${r.id}',this.value)" placeholder="Cómo me sentí, molestias, técnica, etc.">${esc(r.notes)}</textarea></div><div class="sticky"><div class="grid"><button class="btn blue" onclick="saveAndHome('${r.id}')">Guardar sesión</button><button class="btn danger" onclick="deleteRecord('${r.id}')">Eliminar</button></div></div></div>`}
function exerciseHTML(r,ei,e){
  const rows=e.sets.map((s,si)=>{
    const doneClass=s.done?'done':'';
    const doneIcon=s.done?'✓':'○';
    return `<div class="setrow"><div class="setnum">${si+1}</div><input class="input" inputmode="decimal" placeholder="reps" value="${esc(s.reps)}" onchange="upd('${r.id}',${ei},${si},'reps',this.value)"><input class="input" inputmode="decimal" placeholder="kg" value="${esc(s.weight)}" onchange="upd('${r.id}',${ei},${si},'weight',this.value)"><input class="input" inputmode="decimal" placeholder="RIR" value="${esc(s.rir)}" onchange="upd('${r.id}',${ei},${si},'rir',this.value)"><button class="check ${doneClass}" onclick="toggle('${r.id}',${ei},${si})">${doneIcon}</button></div>`;
  }).join('');
  return `<div class="exercise"><div class="between"><div><h3>${esc(e.name)}</h3><div class="target">Objetivo: ${esc(e.target)} · Base: ${esc(e.base)}</div></div></div><div class="sets">${rows}</div><button class="addset" onclick="addSet('${r.id}',${ei})">+ Añadir serie</button><textarea class="input" placeholder="Nota del ejercicio" onchange="updateExNote('${r.id}',${ei},this.value)">${esc(e.notes)}</textarea></div>`;
}
function mutate(id,fn){const all=load(),r=all.find(x=>x.id===id);if(!r)return;fn(r);save(all)}
function upd(id,ei,si,k,v){mutate(id,r=>r.exercises[ei].sets[si][k]=v)}
function toggle(id,ei,si){mutate(id,r=>r.exercises[ei].sets[si].done=!r.exercises[ei].sets[si].done);openRecord(id)}
function addSet(id,ei){mutate(id,r=>r.exercises[ei].sets.push({reps:'',weight:'',rir:'',done:false}));openRecord(id)}
function updateNote(id,v){mutate(id,r=>r.notes=v)}
function updateExNote(id,ei,v){mutate(id,r=>r.exercises[ei].notes=v)}
function updateDate(id,v){mutate(id,r=>r.date=v)}
function saveAndHome(id){mutate(id,r=>r.savedAt=new Date().toISOString());home()}
function deleteRecord(id){if(confirm('¿Eliminar esta sesión?')){save(load().filter(r=>r.id!==id));home()}}
function exportData(){const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gym-tracker-respaldo.json';a.click();URL.revokeObjectURL(a.href)}
function importData(){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=()=>{const f=input.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);if(!Array.isArray(x))throw 0;save(x);home()}catch{alert('El archivo no parece un respaldo válido.')}};rd.readAsText(f)};input.click()}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
home();
