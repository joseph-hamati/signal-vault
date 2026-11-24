"use strict";

const el = id => document.getElementById(id);
const dialog = el("terminal");
const screen = el("screen");
const saveKey = "signal-vault-campaign-v1";
let save = {cleared:[], sector:0, best:null};
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(saveKey) || "null");
  if (stored && Array.isArray(stored.cleared)) {
    save.cleared = [...new Set(stored.cleared.filter(i => Number.isInteger(i) && i>=0 && i<sectors.length))];
    if (Number.isInteger(stored.sector) && stored.sector>=0 && stored.sector<sectors.length) save.sector=stored.sector;
    if (Number.isFinite(stored.best)) save.best=stored.best;
  }
} catch {
  storageAvailable=false;
}
let current = -1;
const world = makeWorld(el("world"), selectSector);
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
    button.lastElementChild.textContent=save.cleared.includes(i) ? "✓" : "·";
    button.setAttribute("aria-label",`${sectors[i].title}${save.cleared.includes(i) ? ", restored" : ""}`);
  });
  el("progress").value=save.cleared.length;
  el("progress-text").textContent=`${save.cleared.length} / ${sectors.length} sectors restored`;
  el("world-status").textContent=storageAvailable ? (save.cleared.length===sectors.length ? "Grid online" : "Progress saved on this device") : "Progress is stored for this session";
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

function installLab(kind) {
  const lab = el("lab");
  if (!lab) return;
  let state=0;
  const config={
    gate: {names:["A","B"], output: ([a,b]) => `Y = ${gate[el("operator").value](a,b)}`},
    adder: {names:["A","B"], output: ([a,b]) => `Carry = ${a&b} · Sum = ${a^b} · Total = ${a+b}`},
    mux: {names:["B","A","D0","D1","D2","D3"], output: ([b,a,...data]) => `D${2*b+a} selected · Y = ${data[2*b+a]}`},
    demux: {names:["B","A","X"], output: ([b,a,x]) => `D0 D1 D2 D3 = ${[0,1,2,3].map(i=>i===2*b+a?x:0).join(" ")}`},
    clock: {names:["D"], output: () => `Q = ${state}`},
    mask: {names:["b7","b6","b5","b4","b3","b2","b1","b0"], output: data => {
      const byte=parseInt(data.join(""),2);
      return `Byte ${digits(byte,16).padStart(2,"0")} · AND F0 → ${digits(byte&240,16).padStart(2,"0")} · XOR 0F → ${digits(byte^15,16).padStart(2,"0")}`;
    }}
  }[kind];
  const values=config.names.map(()=>0);
  lab.innerHTML=`<strong>Interactive circuit bench</strong><div id="switches"></div>
    ${kind==="gate" ? `<label>Gate <select id="operator">${Object.keys(gate).map(name=>`<option>${name}</option>`).join("")}</select></label>` : ""}
    ${kind==="clock" ? '<button id="edge">Pulse rising edge</button>' : ""}
    <output id="lab-out" aria-live="polite"></output>`;
  const update=()=>{el("lab-out").textContent=config.output(values);};
  config.names.forEach((name,i)=>{
    const button=document.createElement("button");
    const label=()=>{button.textContent=`${name} = ${values[i]}`;button.setAttribute("aria-pressed",String(Boolean(values[i])));};
    button.onclick=()=>{values[i]^=1;label();update();};
    label();
    el("switches").append(button);
  });
  if (kind==="gate") el("operator").onchange=update;
  if (kind==="clock") el("edge").onclick=()=>{state=values[0];update();};
  update();
}

function lessonScreen() {
  const index=current;
  const sector=sectors[index];
  show(sector.topic,sector.title,`
    <p class="story">${sector.story}</p>
    <h3>Field notes</h3>
    <ol>${sector.notes.map(note=>`<li>${note}</li>`).join("")}</ol>
    <div class="worked"><strong>Worked example</strong>${sector.example}</div>
    ${sector.lab ? '<div id="lab" class="lab"></div>' : ""}
    <div class="actions"><button class="primary" id="mission">${save.cleared.includes(index) ? "Replay challenges" : "Start mission"}</button>
    <button id="extra">Generate practice</button></div>`);
  installLab(sector.lab);
  el("mission").onclick=()=>practice(index,[...sector.practice,generate(index,true)],true);
  el("extra").onclick=()=>practice(index,[],false);
}

function practice(index, questions, mission) {
  const sector=sectors[index];
  let step=0, solved=0, attempts=0;
  function next() {
    if (mission && step===questions.length) {
      save.cleared=[...new Set([...save.cleared,index])];
      persist();
      renderProgress();
      show("Mission complete",sector.title,`
        <p class="story">${save.cleared.length===sectors.length ? "All twelve sectors are online. The city has power. Run the final systems check." : "The terminal accepts your repair. The signal returns to this sector."}</p>
        <p>You solved all five challenges in ${attempts} answer checks.</p>
        <div class="actions"><button class="primary" id="advance">${index===sectors.length-1 ? "Open final exam" : "Travel to next sector"}</button><button id="revisit">Review field notes</button></div>`);
      el("advance").onclick=()=>{
        if (index===sectors.length-1) examBrief();
        else { dialog.close(); world.jump(index+1); }
      };
      el("revisit").onclick=lessonScreen;
      return;
    }
    const question=mission ? questions[step] : generate(index,step%3===2);
    show(mission ? `Mission challenge ${step+1} / ${questions.length}` : `Practice · ${solved} solved`,sector.title,`
      <form id="answer-form">
        <label for="answer">${question.prompt}</label>
        <input id="answer" name="answer" autocomplete="off" spellcheck="false" required>
        <div id="feedback" class="feedback" role="status"></div>
        <div class="actions">
          <button class="primary" id="check">Check answer</button>
          <button type="button" id="hint">Hint</button>
          <button type="button" id="solution">Show solution</button>
          <button type="button" id="notes">Field notes</button>
        </div>
      </form>`);
    const input=el("answer"), feedback=el("feedback"), check=el("check");
    input.focus();
    el("hint").onclick=()=>{feedback.textContent=question.hint;};
    el("notes").onclick=lessonScreen;
    function finish(correct) {
      input.disabled=true;
      el("hint").disabled=true;
      el("solution").disabled=true;
      check.type="button";
      check.textContent=correct ? "Continue" : "Try a new question";
      feedback.classList.toggle("success",correct);
      feedback.textContent=`${correct ? "Correct." : `Answer: ${question.answer}.`} ${question.why}`;
      if (correct) {
        step++;
        solved++;
      } else if (mission) {
        questions[step]=generate(index,true);
      } else {
        step++;
      }
      check.onclick=next;
      check.focus();
    }
    el("solution").onclick=()=>finish(false);
    el("answer-form").onsubmit=event=>{
      event.preventDefault();
      if (input.disabled) return;
      attempts++;
      if (matches(input.value,question)) finish(true);
      else {
        feedback.textContent="Check your working and try again. A hint is available.";
        input.select();
      }
    };
  }
  next();
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
el("drill").onclick=()=>practice(current,[],false);
world.jump(save.sector);
