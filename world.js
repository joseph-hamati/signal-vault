"use strict";

function makeWorld(canvas, onPosition, isRestored) {
  const ctx = canvas.getContext("2d");
  const spacing = 10;
  const end = sectors.length * spacing;
  const camera = {x:0, z:1, yaw:0};
  const keys = new Set();
  const faces = [];
  let previous = 0;

  function face(vertices, color, line = "") {
    faces.push({vertices, color, line});
  }

  function box(x,y,z,w,h,d,colors,line="") {
    const a=[x,y,z], b=[x+w,y,z], c=[x+w,y+h,z], e=[x,y+h,z];
    const f=[x,y,z+d], g=[x+w,y,z+d], j=[x+w,y+h,z+d], k=[x,y+h,z+d];
    face([a,b,c,e],colors[0],line);
    face([f,k,j,g],colors[0],line);
    face([a,e,k,f],colors[1],line);
    face([b,g,j,c],colors[1],line);
    face([e,c,j,k],colors[2],line);
    face([a,f,g,b],colors[1],line);
  }

  for (let i=0;i<sectors.length;i++) {
    const z = i*spacing;
    const tint = sectors[i].color;
    for (let cell=0;cell<5;cell++) {
      for (let lane=-2;lane<2;lane++) {
        const x = lane*2;
        const start = z + cell*2;
        face([[x,0,start],[x+2,0,start],[x+2,0,start+2],[x,0,start+2]],
          (cell+lane)%2===0 ? "#142631" : "#10202e","#284556");
        face([[x,3.65,start],[x,3.65,start+2],[x+2,3.65,start+2],[x+2,3.65,start]],
          "#101a27","#233748");
      }
    }
    for (const side of [-1,1]) {
      const x = side*4;
      face([[x,0,z],[x,0,z+10],[x,3.65,z+10],[x,3.65,z]],side===1?"#162b39":"#142332","#32495b");
      box(side===1 ? 3.72 : -4,0,z+.2,.28,3.65,.52,["#2c4151","#192c38","#395a67"]);
      box(side===1 ? 3.88 : -4,.22,z+.75,.12,.045,8.8,[tint,tint,tint]);
      box(side===1 ? 3.55 : -4,2.65,z+2.5,.45,.08,5,["#345065","#345065","#39586b"]);
    }
    for (const x of [-2.6,2.25]) {
      box(x,3.54,z+1,.35,.12,5,["#597384","#526c82","#526c82"]);
      face([[x,3.535,z+1],[x+.35,3.535,z+1],[x+.35,3.535,z+6],[x,3.535,z+6]],tint);
    }
    // A freestanding circuit cabinet with a lit terminal face.
    const rack = i%2===0 ? 2.0 : -3.45;
    box(rack,0,z+5.2,1.45,2.45,.9,["#26394b","#132330","#385363"],"#466471");
    face([[rack+.11,1.25,z+5.18],[rack+1.34,1.25,z+5.18],[rack+1.34,2.22,z+5.18],[rack+.11,2.22,z+5.18]],"#09212b",tint);
    face([[rack+.17,1.98,z+5.16],[rack+.33,1.98,z+5.16],[rack+.33,2.09,z+5.16],[rack+.17,2.09,z+5.16]],
      ()=>isRestored(i) ? "#80ffd0" : "#ff835b");
    for (let n=0;n<5;n++) {
      const x=rack+.24+n*.21;
      const y=1.38+(n%3)*.13;
      face([[x,1.35,z+5.17],[x+.075,1.35,z+5.17],[x+.075,y+.35,z+5.17],[x,y+.35,z+5.17]],tint);
    }
    // The overhead beam marks the next sector without obstructing the path.
    box(-4,3.24,z+9.45,8,.42,.55,["#2c4658","#132432","#314b57"]);
    box(-1.54,3.26,z+9.43,3.08,.055,.025,[tint,tint,tint]);
  }
  face([[-4,0,end],[4,0,end],[4,3.65,end],[-4,3.65,end]],"#1a303b","#39616d");
  face([[4,0,0],[-4,0,0],[-4,3.65,0],[4,3.65,0]],"#1a303b","#39616d");

  function draw() {
    const ratio = Math.min(devicePixelRatio || 1,2);
    const w = Math.round(canvas.clientWidth*ratio);
    const h = Math.round(canvas.clientHeight*ratio);
    if (!w || !h) return;
    if (canvas.width!==w || canvas.height!==h) {
      canvas.width=w;
      canvas.height=h;
    }
    ctx.fillStyle="#091420";
    ctx.fillRect(0,0,w,h);
    const sin=Math.sin(camera.yaw), cos=Math.cos(camera.yaw);
    const scale=Math.min(w*.69,h*.94);
    const center=h*.48;
    const near=.14;
    const polygons=[];
    for (const item of faces) {
      if (Math.abs(item.vertices[0][2]-camera.z)>46) continue;
      const points = item.vertices.map(([x,y,z]) => {
        const dx=x-camera.x, dz=z-camera.z;
        return [dx*cos-dz*sin,y-1.63,dx*sin+dz*cos];
      });
      const clipped=[];
      for (let i=0;i<points.length;i++) {
        const a=points[i], b=points[(i+1)%points.length];
        if (a[2]>=near) clipped.push(a);
        if ((a[2]>=near)!==(b[2]>=near)) {
          const t=(near-a[2])/(b[2]-a[2]);
          clipped.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);
        }
      }
      if (clipped.length<3) continue;
      const depth=clipped.reduce((sum,v)=>sum+v[2],0)/clipped.length;
      polygons.push({...item,depth,screen:clipped.map(([x,y,z])=>[w/2+x*scale/z,center-y*scale/z])});
    }
    polygons.sort((a,b)=>b.depth-a.depth);
    for (const {screen,color,line,depth} of polygons) {
      ctx.beginPath();
      ctx.moveTo(...screen[0]);
      screen.slice(1).forEach(point=>ctx.lineTo(...point));
      ctx.closePath();
      ctx.fillStyle=typeof color==="function" ? color() : color;
      ctx.fill();
      if (line) {
        ctx.lineWidth=ratio;
        ctx.strokeStyle=line;
        ctx.stroke();
      }
      ctx.fillStyle=`rgba(7,15,24,${Math.min(.82,Math.max(0,(depth-3)/47))})`;
      ctx.fill();
    }
    const glow=ctx.createRadialGradient(w/2,h*.47,h*.22,w/2,h*.47,Math.max(w,h)*.68);
    glow.addColorStop(0,"#0000");
    glow.addColorStop(1,"#02050bcc");
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,w,h);
  }

  function tick(time) {
    const dt = Math.min(.045, (time-previous)/1000);
    previous=time;
    if (keys.size) {
      camera.yaw += (Number(keys.has("right"))-Number(keys.has("left")))*dt*1.9;
      const step = (Number(keys.has("forward"))-Number(keys.has("back")))*dt*5.2;
      camera.x=Math.max(-1.7,Math.min(1.7,camera.x+Math.sin(camera.yaw)*step));
      camera.z=Math.max(.42,Math.min(end-.5,camera.z+Math.cos(camera.yaw)*step));
      onPosition(Math.floor(camera.z/spacing));
      draw();
    }
    requestAnimationFrame(tick);
  }
  new ResizeObserver(draw).observe(canvas);
  requestAnimationFrame(tick);
  return {
    keys,
    redraw:draw,
    jump(index) {
      keys.clear();
      Object.assign(camera,{x:0,z:index*spacing+1,yaw:0});
      onPosition(index);
      draw();
    }
  };
}
