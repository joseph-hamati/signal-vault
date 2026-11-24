"use strict";

const hexByte = value => digits(value,16).padStart(2,"0");
const prettyBits = value => bits(value,8).replace(/(.{4})(.{4})/,"$1 $2");
const symbols = "0123456789ABCDEF";
const picker = (label, key, options, value = "") => `<label class="component">${label}
  <select data-key="${key}"><option value="">— Connect —</option>
  ${options.map(([id,name])=>`<option value="${id}" ${String(id)===String(value)?"selected":""}>${name}</option>`).join("")}</select></label>`;
const named = labels => labels.map(label=>[label,label]);
const indexed = labels => labels.map((name,i)=>[i,name]);
const table = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

function connectValue(values, input, pins) {
  const read = wire => Object.hasOwn(values,wire) ? values[wire] : null;
  const args = input.map(read);
  return args.length===pins && args.every(bit=>bit!==null) ? args : null;
}

function simulateCircuit(spec, settings, row) {
  const values = {LOW:0,HIGH:1};
  spec.inputs.forEach((label,i)=>{values[label]=(row>>(spec.inputs.length-i-1))&1;});
  spec.slots.forEach((_,i)=>{
    const part=settings[i] || {};
    const kind=part.kind;
    const arity=kind==="NOT" || kind==="BUFFER" ? 1 : 2;
    const args=connectValue(values,[part.a,part.b].slice(0,arity),arity);
    values[`G${i+1}`]=kind && args ? gate[kind](...args) : null;
  });
  return values;
}

function makeWorkbench(order) {
  const spec=order.spec;
  switch(order.kind){
    case "route": return routeBench(spec);
    case "load": return loadBench(spec);
    case "machine": return machineBench(spec);
    case "group": return groupBench(spec);
    case "circuit": return circuitBench(spec);
    case "mapping": return mappingBench(spec);
    case "memory": return memoryBench(spec);
    case "counter": return counterBench(spec);
    case "mask": return maskBench(spec);
  }
  throw Error("Unknown workbench");
}

function routeBench({parts,route}){
  const placed=[];
  return {
    view(){
      const available=parts.filter(part=>!placed.includes(part));
      return `<div class="rack">${route.map((_,i)=>`<button data-action="remove" data-index="${i}" ${placed[i]?"":"disabled"}>${placed[i] || "Empty socket"}</button>`).join("<span aria-hidden='true'>→</span>")}</div>
        <div class="actions">${available.map(part=>`<button data-action="insert" data-index="${parts.indexOf(part)}">${part}</button>`).join("")}</div>
        <p class="muted">Install components in signal order. Select an installed component to remove it.</p>`;
    },
    act(action,index){
      if (action==="insert" && placed.length<route.length && !placed.includes(parts[index])) placed.push(parts[index]);
      if (action==="remove") placed.splice(index,1);
    },
    result(){
      const wrong=route.findIndex((part,i)=>placed[i]!==part);
      return wrong<0 ? "" : `Commissioning stopped at socket ${wrong+1}. Trace what enters that socket and what it needs to send onward.`;
    }
  };
}

function loadBench({base,target,width,fractional}){
  const state=Array(width+fractional).fill(0);
  const exponents=state.map((_,i)=>width-i-1);
  const scale=base**fractional;
  const units=()=>state.reduce((sum,value,i)=>sum+value*base**(exponents[i]+fractional),0);
  return {
    view(){
      return `<p>Base ${base} · Target <strong>${target}</strong> decimal · Live total <output>${units()/scale}</output></p>
        <div class="rack">${state.map((digit,i)=>(i===width?"<strong>.</strong>":"")+
          picker(`${base}^${exponents[i]}`,i,indexed([...symbols.slice(0,base)]),digit)).join("")}</div>
        ${table(["Place","Digit","Contribution"],state.map((value,i)=>[`${base}^${exponents[i]}`,symbols[value],value*base**exponents[i]]))}`;
    },
    change(key,value){if(value!=="") state[Number(key)]=Number(value);},
    result(){
      return units()===Math.round(target*scale) ? "" : `The live total is ${units()/scale}. Adjust the largest place that can account for the difference.`;
    }
  };
}

function machineBench({value,base,mode,denominator}){
  const division=mode==="divide";
  const cap=8;
  const rack=[];
  const steps=[];
  let remaining=value;
  let pending=null, cartridge=null, fault="";
  const complete=()=>remaining===0 || (!division && rack.length>=cap);
  return {
    view(){
      const held=division ? remaining : `${remaining}/${denominator}`;
      return `<p>Destination base <strong>${base}</strong> · ${division?"Current dividend":"Remaining fraction"} <strong>${held}</strong></p>
        <div class="worked"><strong>${division?"Integer output register":"Fractional output register"}</strong>
        <output>${division?"":"0."}${(division?[...rack].reverse():rack).map(d=>symbols[d]).join("") || "—"}</output></div>
        ${pending ? `<p>${pending.equation}</p><div class="rack">
          ${picker("Digit cartridge","cartridge",indexed([...symbols.slice(0,base)]),cartridge)}
          <button data-action="transfer">Load next socket</button></div>
          ${fault ? `<p class="feedback" role="status">${fault}</p>` : ""}`
          : complete() ? `<p>${remaining ? "Precision limit reached. There is still a nonzero remainder." : "Remainder exhausted. The conversion is exact."}</p>`
          : `<button data-action="cycle">${division?"Divide once":"Multiply once"}</button>`}
        ${steps.length ? table(["Cycle","Operation","Digit installed"],steps.map((step,i)=>[i+1,step.equation,symbols[step.digit]])):""}`;
    },
    change(key,value){
      cartridge=value==="" ? null : Number(value);
      fault="";
    },
    act(action){
      if(action==="cycle" && !complete() && !pending){
        if(division){
          const quotient=Math.floor(remaining/base), digit=remaining%base;
          pending={equation:`${remaining} ÷ ${base} = ${quotient}, remainder ${digit}`,digit,next:quotient};
        } else {
          const product=remaining*base, digit=Math.floor(product/denominator), next=product%denominator;
          pending={equation:`${remaining}/${denominator} × ${base} = ${digit} + ${next}/${denominator}`,digit,next};
        }
      } else if(action==="transfer" && pending){
        if(cartridge!==pending.digit){
          fault=division ? "Load a cartridge matching the remainder." : "Load a cartridge matching the integer part of the product.";
          return;
        }
        rack.push(cartridge);
        cartridge=null;
        fault="";
        remaining=pending.next;
        steps.push(pending);
        pending=null;
      }
    },
    result(){return complete() ? "" : "Finish the remaining cycles and transfer the last produced digit.";}
  };
}

function groupBench({binary,base}){
  const size=Math.log2(base);
  const [whole,fraction=""]=binary.split(".");
  const pad=n=>(size-n%size)%size;
  const leftPad=pad(whole.length), rightPad=pad(fraction.length);
  const expected=[...whole.padStart(whole.length+leftPad,"0").match(new RegExp(`.{${size}}`,"g")),
    ...(fraction.padEnd(fraction.length+rightPad,"0").match(new RegExp(`.{${size}}`,"g"))||[])];
  const position=(whole.length+leftPad)/size;
  const sockets=expected.map(()=>null);
  let left=0,right=0;
  return {
    view(){
      const ready=left===leftPad && right===rightPad;
      return `<p>Base ${base} connector · ${size} bits per socket</p>
        <div class="worked"><strong>Incoming signal</strong><code>${"0".repeat(left)}${whole}${fraction ? "."+fraction+"0".repeat(right):""}</code></div>
        <div class="actions"><button data-action="left" ${left===size-1?"disabled":""}>Pad left</button>
        ${fraction ? `<button data-action="right" ${right===size-1?"disabled":""}>Pad right</button>`:""}
        <button data-action="clear">Remove padding</button></div>
        ${ready ? `<div class="rack">${expected.map((chunk,i)=>(i===position?"<strong>.</strong>":"")+
          picker(chunk,i,indexed([...symbols.slice(0,base)]),sockets[i])).join("")}</div>`
          : "<p class='muted'>The coupler contacts align once both sides of the point are whole groups.</p>"}`;
    },
    act(action){
      if(action==="clear"){left=0;right=0;}
      else if(action==="left") left++;
      else if(action==="right") right++;
    },
    change(key,value){sockets[Number(key)]=value==="" ? null : Number(value);},
    result(){
      if(left!==leftPad || right!==rightPad) return "Align the contacts by padding the outside ends.";
      const bad=expected.findIndex((chunk,i)=>sockets[i]!==parseInt(chunk,2));
      return bad<0 ? "" : `Socket ${bad+1} is open or mismatched. Decode its bits using weights ${Array.from({length:size},(_,i)=>2**(size-i-1)).join(", ")}.`;
    }
  };
}

function circuitBench(spec){
  const {inputs,slots,outputs}=spec;
  const settings=slots.map(choices=>({kind:choices.length===1?choices[0]:"",a:"",b:""}));
  const wires=outputs.map(()=> "");
  const count=2**inputs.length;
  const label=i=>`G${i+1}`;
  const expected=(mask,row)=>(mask>>(count-1-row))&1;
  const read=(row)=>{
    const values=simulateCircuit(spec,settings,row);
    return wires.map(wire=>values[wire]??null);
  };
  const catalog=["LOW","HIGH",...inputs];
  return {
    view(){
      const gates=settings.map(({kind,a,b},i)=>{
        const sources=named([...catalog,...settings.slice(0,i).map((_,j)=>label(j))]);
        return `<div class="wiring"><strong>${label(i)}</strong>${picker("Part",`${i}.kind`,named(slots[i]),kind)}
        ${picker("Pin 1",`${i}.a`,sources,a)}${kind==="NOT" || kind==="BUFFER" ? "" : picker("Pin 2",`${i}.b`,sources,b)}</div>`;
      }).join("");
      const sources=named([...catalog,...settings.map((_,i)=>label(i))]);
      return `<div class="circuit">${gates}<div class="rack">${outputs.map(([name],i)=>picker(`${name} output`,`out.${i}`,sources,wires[i])).join("")}</div></div>
        ${table([...inputs,...outputs.flatMap(([name])=>[`${name} target`,`${name} live`])],
        Array.from({length:count},(_,row)=>[...bits(row,inputs.length),...read(row).flatMap((value,i)=>[expected(outputs[i][1],row),value??"—"])]))}`;
    },
    change(key,value){
      const [i,field]=key.split(".");
      if(i==="out") wires[Number(field)]=value;
      else settings[Number(i)][field]=value;
    },
    result(){
      for(let row=0;row<count;row++){
        const values=read(row);
        const bad=values.findIndex((value,i)=>value!==expected(outputs[i][1],row));
        if(bad>=0) return `${outputs[bad][0]} fails at ${inputs.join("")}=${bits(row,inputs.length)}. Trace that row from the inputs through each gate.`;
      }
      return "";
    }
  };
}

function mappingBench({source,target,mode}){
  const values=target.map(()=>null);
  let selected=0;
  let high=1;
  const width=Math.log2(source.length);
  const code=i=>bits(i,width);
  const encoder=mode==="encoder";
  const options=indexed(encoder ? source.map((_,i)=>code(i)) : source);
  const rowName=i=>encoder ? source[i] : code(i);
  return {
    view(){
      const value=values[selected];
      const observed=value===null ? "Open circuit" : encoder ? code(value) : mode==="mux" ?
        `${source[value]} → receiver` : `X=${high} · Outputs ${source.map((_,i)=>i===value?high:0).join(" ")}`;
      return `<div class="rack">${target.map((_,i)=>picker(rowName(i),i,options,values[i])).join("")}</div>
        <div class="actions">${target.map((_,i)=>`<button data-action="probe" data-index="${i}" aria-pressed="${selected===i}">Probe ${rowName(i)}</button>`).join("")}
        ${mode==="demux" ? `<button data-action="toggle">Toggle data (X=${high})</button>` : ""}</div>
        <p>Live probe <output>${observed}</output></p>
        <details><summary>Site manifest</summary>${table([encoder?"Physical input":"Select code",encoder?"Code":"Socket"],
          target.map((value,i)=>[rowName(i),encoder?code(value):source[value]]))}</details>`;
    },
    change(key,value){values[Number(key)]=value===""?null:Number(value);},
    act(action,i){if(action==="probe") selected=i; else if(action==="toggle") high^=1;},
    result(){
      const wrong=values.findIndex((value,i)=>target[i]!==value);
      return wrong<0 ? "" : `The relay map fails at ${rowName(wrong)}. Check the manifest and probe that route.`;
    }
  };
}

function memoryBench({initial,events,desired}){
  let d=0,qValue=initial;
  const history=[];
  return {
    view(){
      const cursor=history.length;
      return `<p>Live <output>D=${d} · Q=${qValue}</output></p>
      <div class="actions"><button data-action="toggle" aria-pressed="${Boolean(d)}">Toggle D</button>
      <button data-action="step" ${cursor>=events.length?"disabled":""}>${cursor>=events.length?"Trace complete":events[cursor]?"Pulse rising edge":"Advance through silence"}</button></div>
      ${table(["Step","Clock","Target Q","D applied","Stored Q"],events.map((edge,i)=>[i+1,edge?"Rising edge":"No edge",desired[i],history[i]?.d??"—",history[i]?.qValue??"—"]))}`;
    },
    act(action){
      if(action==="toggle") d^=1;
      else if(action==="step" && history.length<events.length){
        if(events[history.length]) qValue=d;
        history.push({d,qValue});
      }
    },
    result(){
      if(history.length<events.length) return "Complete the clock trace first.";
      const wrong=history.findIndex((step,i)=>step.qValue!==desired[i]);
      return wrong<0 ? "" : `The trace diverges at step ${wrong+1}. Reset the bench and set D before the relevant rising edge.`;
    }
  };
}

function counterBench({start,edges,target,widths}){
  let width=widths[0], count=0, value=start;
  const trace=[start];
  return {
    view(){
      return `<div class="rack">${picker("Counter width","width",widths.map(w=>[w,`${w} bits`]),width)}
        <button data-action="pulse" ${count>=edges?"disabled":""}>Pulse clock</button></div>
        <p>Target <strong>${target}</strong> · Pulses <strong>${count}/${edges}</strong> · Current <output>${value} (${bits(value,width)}₂)</output></p>
        <p>State trace <code>${trace.join(" → ")}</code></p>`;
    },
    change(key,input){if(input==="") return;width=Number(input);count=0;value=start;trace.splice(1);},
    act(action){if(action==="pulse" && count<edges){value=(value+1)%2**width;count++;trace.push(value);}},
    result(){return count===edges && value===target ? "" : "Complete the required pulses. If the endpoint differs, change the counter width and run the trace again.";}
  };
}

function maskBench({start,target,allowed,budget}){
  const history=[];
  const opNames=["AND","OR","XOR","SHIFT RIGHT"];
  let opcode="AND", operand=allowed[0], value=start;
  return {
    view(){
      return `<p>Target <strong>${hexByte(target)}</strong> · Current <output>${hexByte(value)} · ${prettyBits(value)}</output></p>
        <div class="rack">${picker("Instruction","op",named(opNames),opcode)}
        ${opcode==="SHIFT RIGHT"?"<p>Logical shift by one</p>":picker("Mask byte","mask",allowed.map(x=>[x,`${hexByte(x)} · ${prettyBits(x)}`]),operand)}
        <button data-action="execute" ${history.length>=budget?"disabled":""}>Execute</button>
        <button data-action="undo" ${history.length?"":"disabled"}>Undo</button></div>
        <p>Instruction budget ${history.length} / ${budget}</p>
        ${history.length ? table(["Before","Instruction","After"],history.map(step=>[hexByte(step.before),step.label,hexByte(step.after)])):""}`;
    },
    change(key,input){if(input==="") return;if(key==="op") opcode=input;else operand=Number(input);},
    act(action){
      if(action==="undo" && history.length) value=history.pop().before;
      if(action==="execute" && history.length<budget){
        const after=opcode==="SHIFT RIGHT" ? value>>>1 : gate[opcode](value,operand);
        const label=opcode==="SHIFT RIGHT" ? "Logical shift right by 1" : `${opcode} ${hexByte(operand)}`;
        history.push({before:value,label,after});
        value=after;
      }
    },
    result(){return value===target ? "" : "The control word differs from the target. Inspect the intermediate bytes and undo any instruction that altered the wrong flags.";}
  };
}
