"use strict";

const el = id => document.getElementById(id);
const dialog = el("terminal");
const screen = el("screen");
const saveKey = "signal-vault-campaign-v2";
const legacySaveKey = "signal-vault-campaign-v1";
let save = {cleared:[], sector:0, best:null, jobs:Array(operations.length).fill(0), uplink:0};
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(saveKey) || localStorage.getItem(legacySaveKey) || "null");
  if (stored) {
    if (Number.isInteger(stored.sector) && stored.sector>=0 && stored.sector<sectors.length) save.sector=stored.sector;
    if (Number.isFinite(stored.best)) save.best=stored.best;
    save.jobs=save.jobs.map((_,i)=>Math.max(0,Math.min(operations[i].length,Number(stored.jobs?.[i])|0)));
    save.uplink=Math.max(0,Math.min(capstones.length,Number(stored.uplink)|0));
    save.cleared=save.jobs.flatMap((jobs,i)=>jobs===operations[i].length ? [i] : []);
  }
} catch {
  storageAvailable=false;
}
let current = -1;
const world = makeWorld(el("world"), selectSector, index=>save.cleared.includes(index));
const map = el("map");
const destination = sectors.map(({title},i) => {
  const button=document.createElement("button");
  button.innerHTML=`<span>${String(i+1).padStart(2,"0")}</span><span>${title}</span><span></span>`;
  button.onclick=()=>world.jump(i);
  map.append(button);
  return button;
});

function persist() {
  try {
    localStorage.setItem(saveKey,JSON.stringify(save));
    storageAvailable=true;
  } catch {
    storageAvailable=false;
  }
}
function renderProgress() {
  destination.forEach((button,i)=>{
    button.setAttribute("aria-current",String(i===current));
    button.lastElementChild.textContent=save.cleared.includes(i) ? "✓" : `${save.jobs[i]}/${operations[i].length}`;
    button.setAttribute("aria-label",`${sectors[i].title}${save.cleared.includes(i) ? ", restored" : ""}`);
  });
  el("progress").value=save.cleared.length;
  el("progress-text").textContent=`${save.cleared.length} / ${sectors.length} sectors restored`;
  el("finale").textContent=save.uplink===capstones.length ? "Uplink online" : "City uplink";
  el("world-status").textContent=storageAvailable ? (save.uplink===capstones.length ? "Grid online" : "Progress saved on this device") : "Progress is stored for this session";
  el("exam").textContent=save.best===null ? "Final exam" : `Final exam · best ${save.best}%`;
}
function selectSector(index) {
  if (index===current) return;
  current=index;
  save.sector=index;
  persist();
  el("location").textContent=sectors[index].title;
  el("sector").textContent=`SECTOR ${String(index+1).padStart(2,"0")} / ${sectors[index].topic.toUpperCase()}`;
  renderProgress();
}
function show(label,title,html) {
  world.keys.clear();
  el("dialog-label").textContent=label;
  el("dialog-title").textContent=title;
  screen.innerHTML=html;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop=0;
}

function fieldNotes(sector) {
  return `<details><summary>Open field manual</summary>
    <ol>${sector.notes.map(note=>`<li>${note}</li>`).join("")}</ol>
    <div class="worked"><strong>Worked example</strong>${sector.example}</div>
  </details>`;
}

function lessonScreen() {
  const index=current, sector=sectors[index], orders=operations[index];
  const complete=save.jobs[index];
  show(sector.topic,sector.title,`
    <p class="story">${sector.story}</p>
    <p>${complete} of ${orders.length} work orders commissioned</p>
    <div class="jobs">${orders.map((order,i)=>`
      <button data-job="${i}" ${i>complete?"disabled":""}>
      <span>${i<complete?"✓":String(i+1).padStart(2,"0")}</span><strong>${order.name}</strong>
      <span>${i<complete?"Replay":i===complete?"Open":"Pending"}</span></button>`).join("")}</div>
    ${fieldNotes(sector)}`);
  if (complete<orders.length) screen.querySelector(`[data-job="${complete}"]`).classList.add("primary");
  screen.querySelectorAll("[data-job]").forEach(button=>{
    button.onclick=()=>launchOrder(index,Number(button.dataset.job));
  });
}

function uplinkScreen() {
  show("City uplink","Commission the city grid",`
    <p class="story">The districts can talk again. The uplink must translate, protect, route, store, and commit a live handover before the city can return to normal.</p>
    ${save.cleared.length<sectors.length ?
      `<p>Restore every sector to unlock the city uplink. ${save.cleared.length} of ${sectors.length} sectors are online.</p>` :
      `<p>${save.uplink} of ${capstones.length} commissioning stages passed.</p>
      <div class="jobs">${capstones.map((order,i)=>`<button data-job="${i}" ${i>save.uplink?"disabled":""}>
      <span>${i<save.uplink?"✓":String(i+1).padStart(2,"0")}</span><strong>${order.name}</strong>
      <span>${i<save.uplink?"Replay":i===save.uplink?"Open":"Pending"}</span></button>`).join("")}</div>`}`);
  screen.querySelectorAll("[data-job]").forEach(button=>{
    button.onclick=()=>launchOrder(null,Number(button.dataset.job));
  });
}

function launchOrder(index, step) {
  const finale=index===null;
  const sector=finale ? null : sectors[index];
  const orders=finale ? capstones : operations[index];
  const order=orders[step];
  const back=finale ? uplinkScreen : lessonScreen;
  let bench=makeWorkbench(order);
  show(`Work order ${step+1} / ${orders.length}`,order.name,`
    <p class="story">${order.brief}</p>
    <div class="workbench" id="bench"></div>
    <div class="actions"><button id="commission" class="primary">Run commissioning test</button>
    <button id="reset-bench">Reset bench</button><button id="return-to-sector">Work orders</button></div>
    <div class="feedback" id="bench-feedback" role="status"></div>
    <details><summary>Field note</summary><p>${order.principle}</p></details>
    ${sector ? fieldNotes(sector) : ""}`);
  const panel=el("bench");
  const feedback=el("bench-feedback");
  const draw=()=>{panel.innerHTML=bench.view();};
  function update(target){
    const scroll=dialog.scrollTop;
    const key=target.dataset.key, action=target.dataset.action, index=target.dataset.index;
    feedback.textContent="";
    draw();
    const control=[...panel.querySelectorAll("[data-key], [data-action]")].find(item=>
      key!==undefined ? item.dataset.key===key : item.dataset.action===action && item.dataset.index===index);
    (control && !control.disabled ? control : panel.querySelector("button:not(:disabled), select") || el("commission")).focus({preventScroll:true});
    dialog.scrollTop=scroll;
  }
  panel.onchange=event=>{
    const target=event.target.closest("select[data-key]");
    if(target){bench.change(target.dataset.key,target.value);update(target);}
  };
  panel.onclick=event=>{
    const target=event.target.closest("button[data-action]");
    if(target){bench.act(target.dataset.action,Number(target.dataset.index));update(target);}
  };
  el("return-to-sector").onclick=back;
  el("reset-bench").onclick=()=>{bench=makeWorkbench(order);feedback.textContent="Bench reset.";draw();};
  el("commission").onclick=()=>{
    const issue=bench.result();
    if(issue){feedback.textContent=issue;return;}
    if(finale) save.uplink=Math.max(save.uplink, step+1);
    else {
      save.jobs[index]=Math.max(save.jobs[index],step+1);
      if(save.jobs[index]===orders.length && !save.cleared.includes(index)) save.cleared.push(index);
    }
    persist();
    renderProgress();
    world.redraw();
    const last=step+1===orders.length;
    show("Commissioning passed",order.name,`
      <p class="story">${last ? finale ? "The city accepts the handover. The grid is online." :
        "The sector is back on the grid. Its terminal will now show a live status light." :
        "The equipment passed its acceptance test. The next instrument is ready."}</p>
      <p>${order.principle}</p>
      <div class="actions"><button id="next-order" class="primary">${last ? finale ? "Open final exam" :
        save.cleared.length===sectors.length ? "Open city uplink" : "Travel to next unrestored sector" : "Open next work order"}</button>
      <button id="back-orders">Work orders</button></div>`);
    el("back-orders").onclick=back;
    el("next-order").onclick=()=>{
      if(!last) launchOrder(index,step+1);
      else if(finale) examBrief();
      else if(save.cleared.length===sectors.length) uplinkScreen();
      else {
        const candidates=sectors.map((_,i)=>(index+1+i)%sectors.length);
        world.jump(candidates.find(i=>!save.cleared.includes(i)));
        lessonScreen();
      }
    };
  };
  draw();
}

function examBrief() {
  show("Final systems check","The Blackout Exam",`
    <p class="story">The city is back on the grid. Run a full systems check before handing control over to the night crew.</p>
    <p>Twenty questions cover all twelve sectors and eight mixed-topic problems. Answers and explanations appear after submission. Aim for 17/20 or better.</p>
    <p class="muted">For a timed rehearsal, give yourself 45 minutes. Use paper for your working. Each new attempt generates fresh sector questions.</p>
    <button class="primary" id="begin">Begin exam</button>`);
  el("begin").onclick=()=>runExam();
}

function runExam() {
  const questions=[...sectors.map((item,i)=>({...generate(i,true),topic:item.topic})),
    ...synthesis.map(question=>({...question,topic:"Systems integration"}))];
  for (let i=questions.length-1;i>0;i--) {
    const other=rand(0,i);
    [questions[i],questions[other]]=[questions[other],questions[i]];
  }
  show("Exam in progress","The Blackout Exam",`
    <form id="exam-form" class="exam-grid">
      ${questions.map((question,i)=>`<label>${i+1}. ${question.prompt}<input name="q${i}" autocomplete="off" spellcheck="false"></label>`).join("")}
      <p id="exam-warning" role="status"></p>
      <button class="primary">Submit exam</button>
    </form>`);
  let confirmed=false;
  const form=el("exam-form");
  form.oninput=()=>{confirmed=false;el("exam-warning").textContent="";};
  form.onsubmit=event=>{
    event.preventDefault();
    const values=new FormData(form);
    const answers=questions.map((_,i)=>values.get(`q${i}`).trim());
    const blank=answers.filter(answer=>!answer).length;
    if (blank && !confirmed) {
      confirmed=true;
      el("exam-warning").textContent=`${blank} unanswered. Submit again to grade them as incorrect.`;
      return;
    }
    const correct=questions.map((question,i)=>matches(answers[i],question));
    const total=correct.filter(Boolean).length;
    const percent=Math.round(100*total/questions.length);
    save.best=Math.max(save.best ?? 0,percent);
    persist();
    renderProgress();
    show("Exam report",`${total} / ${questions.length} · ${percent}%`,`
      <p class="story">${percent>=85 ? "You reached the 85% practice target." : "Review the missed skills and retry when you can work through the solutions independently."}</p>
      ${questions.map((question,i)=>`<details ${correct[i] ? "" : "open"}>
        <summary>${correct[i]?"✓":"✕"} ${i+1}. ${question.topic}</summary>
        <p>${question.prompt}</p><p>Your answer <code id="given-${i}"></code></p>
        <p><strong>Expected ${question.answer}</strong> · ${question.why}</p>
      </details>`).join("")}
      <button class="primary" id="retry">New exam attempt</button>`);
    answers.forEach((answer,i)=>{el(`given-${i}`).textContent=answer || "—";});
    el("retry").onclick=examBrief;
  };
}

const bindings={w:"forward",ArrowUp:"forward",s:"back",ArrowDown:"back",a:"left",ArrowLeft:"left",d:"right",ArrowRight:"right"};
const keyName=event=>event.key.length===1 ? event.key.toLowerCase() : event.key;
document.addEventListener("keydown",event=>{
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  const key=keyName(event);
  if (key==="e" && !event.repeat) lessonScreen();
  if (bindings[key]) {event.preventDefault();world.keys.add(bindings[key]);}
});
document.addEventListener("keyup",event=>world.keys.delete(bindings[keyName(event)]));
window.addEventListener("blur",()=>world.keys.clear());
document.querySelectorAll("[data-move]").forEach(button=>{
  const direction=button.dataset.move;
  button.onpointerdown=event=>{
    button.setPointerCapture(event.pointerId);
    world.keys.add(direction);
  };
  button.onlostpointercapture=()=>world.keys.delete(direction);
  button.onkeydown=event=>{if (event.key===" " || event.key==="Enter") world.keys.add(direction);};
  button.onkeyup=event=>{if (event.key===" " || event.key==="Enter") world.keys.delete(direction);};
});
el("close").onclick=()=>dialog.close();
el("open").onclick=lessonScreen;
el("exam").onclick=examBrief;
el("finale").onclick=uplinkScreen;
world.jump(save.sector);
