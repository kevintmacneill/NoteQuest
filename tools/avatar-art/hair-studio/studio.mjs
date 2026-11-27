import {SIZE,POSES,COLORS,STYLES,ANATOMY,ORDER,keyOf,nextEntry,fresh,compile,bounds,traceMask,raster,rgbaPng,sha256} from './core.mjs';

const $ = id => document.getElementById(id);
const state = {fit:fresh(), files:{}, before:[], after:[], view:'Body', zoom:1, pan:[0,0], check:null, dirty:true};
const display = { body:true, front:true, back:true, landmarks:true, scalp:false, grid:false, centerline:false, split:true, flags:true};
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const storageKey = 'notequest.hair-studio.v1';
const history = JSON.parse(localStorage.getItem(storageKey) || '{"bases":{},"revisions":[],"approvals":{}}');
const title = s => s.replace(/^girl-|^boy-|^hc-/,'').replaceAll('-', ' ').replace(/\b\w/g,c=>c.toUpperCase());
const names = {'girl-buns':'Twin Buns','girl-long':'Long Hair','boy-short':'Classic Short','boy-side':'Undercut','boy-buzz':'Buzz Cut','boy-wavy':'Shaggy','hc-brown':'Medium brown','hc-darkbrown':'Dark brown','hc-lightbrown':'Light brown'};
const clone = value => structuredClone(value);
const active = () => Object.fromEntries(['body','pose','style','color'].map(k=>[k,$(k).value]));
const baseKey = () => active().body+'/'+active().pose;
const base = () => history.bases[baseKey()];
const approved = () => history.approvals[keyOf(active())];
function brownRevision() {
  if (active().color==='hc-brown') return null;
  const id=history.approvals[keyOf({...active(),color:'hc-brown'})];
  return history.revisions.find(r=>r.id===id)??null;
}
function sameTargets(fit, other) {
  return JSON.stringify(fit.pins.map(p=>[p.name,p.target]))===JSON.stringify(other.pins.map(p=>[p.name,p.target]));
}
const canFit = () => {
  const next=nextEntry(history.approvals);
  return next && keyOf(next)===keyOf(active());
};
const message = s => $('status').textContent=s;
const run = fn => async (...args) => {
  try { await fn(...args); }
  catch (e) { message(e.message); }
};
function persist() { localStorage.setItem(storageKey,JSON.stringify(history)); }
function options(id, values, selected) {
  $(id).replaceChildren(...values.map(([key,label])=>new Option(label,key,key===selected,key===selected)));
}
function labelOptions(id, values, selected) { options(id,values.map(v=>[v,names[v]??title(v)]),selected); }
function buffer(w=SIZE,h=SIZE) { return Object.assign(document.createElement('canvas'),{width:w,height:h}); }
function pixels(image) {
  const c=buffer(), g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(image,0,0);
  return g.getImageData(0,0,SIZE,SIZE).data;
}
function imageCanvas(data) {
  const c=buffer();
  c.getContext('2d').putImageData(new ImageData(data,SIZE,SIZE),0,0);
  return c;
}
function png(c) {
  return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed.')),'image/png'));
}
function download(blob,name) {
  const url=URL.createObjectURL(blob);
  Object.assign(document.createElement('a'),{href:url,download:name}).click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function encode(blob) {
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result.split(',')[1]);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
function snapshot() {
  state.before.push(clone(state.fit));
  if (state.before.length>60) state.before.shift();
  state.after=[];
}
function applyFit(candidate, record=true) {
  if (!canFit()) throw Error('This fit is view-only under the production sequence.');
  compile(candidate);
  const brown=brownRevision();
  if (brown&&!sameTargets(candidate,brown.fit)) throw Error('Keep the approved brown destination correspondences. Edit the source points for this painting.');
  if (record) snapshot();
  state.fit=candidate;
  invalidate();
  refresh();
}
function invalidate() { state.dirty=true; state.check=null; }
function edit(mutator) { const fit=clone(state.fit); mutator(fit); applyFit(fit); }
function useEntry(entry) {
  for (const k of ['body','pose','color']) $(k).value=entry[k];
  labelOptions('style',STYLES[entry.body],entry.style);
}
function changeEntry() {
  state.fit=clone(brownRevision()?.fit??fresh()); state.files={}; state.before=[]; state.after=[]; state.expected=null;
  state.selectedPin=0; state.selectedNode=0; state.rig=null; state.baseEdit=null; state.addingSection=false;
  for (const id of ['skinFile','scalpFile','frontFile','backFile','originalFile','rigFile','importFile','owner','notes']) $(id).value='';
  invalidate(); focusView('Body'); refresh();
}
labelOptions('body',Object.keys(STYLES),'girl');
options('pose',POSES.map((k,i)=>[k,['Standing','Waving','Walking'][i]]),'front');
labelOptions('color',COLORS,'hc-brown');
options('landmark',ANATOMY.map(n=>[n,n]),'crown');
useEntry(nextEntry(history.approvals)??ORDER[0]);
for (const field of ['body','pose','style','color']) $(field).onchange=()=>{
  if (field==='body') labelOptions('style',STYLES[$('body').value]);
  changeEntry();
};

for (const [key,id] of Object.entries({skin:'skinFile',scalp:'scalpFile',front:'frontFile',back:'backFile',original:'originalFile'})) {
  $(id).onchange=run(async ()=>{
    const f=$(id).files[0];
    const workspace=keyOf(active());
    if (!f) { delete state.files[key]; invalidate(); refresh(); return; }
    const bytes=await f.arrayBuffer();
    const digest=await sha256(bytes);
    if (key!=='original') {
      const b=new Uint8Array(bytes);
      if (b.length<33 || [137,80,78,71,13,10,26,10].some((v,i)=>b[i]!==v)) throw Error('Use a PNG input.');
    }
    const image=key==='original'?null:await createImageBitmap(f,{colorSpaceConversion:'none'});
    if (image && (image.width!==SIZE || image.height!==SIZE)) throw Error('Expected a 1024 × 1024 source.');
    if (workspace!==keyOf(active())) return;
    if (key==='skin' && base()?.skinSha256 && base().skinSha256!==digest) throw Error('Body bytes differ from the saved anatomical plate.');
    const expected=state.expected?.sourceSha256?.[key];
    if (expected && expected!==digest) throw Error('Source hash differs from the saved revision.');
    const data=image?pixels(image):null;
    const box=data?bounds(data):null;
    if (['skin','scalp','front'].includes(key) && !box) throw Error('Source plane is empty.');
    if (data && box && !data.some((value,i)=>i%4===3 && value===0)) throw Error('Source plane needs genuine alpha transparency.');
    state.files[key]={blob:f,sha:digest,image,data,box};
    invalidate(); refresh();
    message(f.name+' loaded.');
  });
}
$('rigFile').onchange=run(async ()=>{
  const f=$('rigFile').files[0];
  if (!f) return;
  const rig=JSON.parse(await f.text());
  if (!rig.zones?.head || rig.zones.head.length!==4 || !rig.zones.head.every(Number.isFinite) ||
      !Number.isFinite(rig.canvas) || rig.canvas<=0 || (rig.sourceSize??rig.canvas)!==SIZE) throw Error('Use the verified 1024-source candidate rig.');
  state.rig={blob:f,sha:await sha256(await f.arrayBuffer()),data:rig};
  if (state.expected?.rigSha256 && state.expected.rigSha256!==state.rig.sha) {
    state.rig=null; throw Error('Rig hash differs from the saved revision.');
  }
  invalidate(); refresh();
});

function numFields(id, fields, commit) {
  $(id).replaceChildren(...fields.map(([key,label,value,step])=>{
    const l=document.createElement('label'); l.textContent=label;
    const a=document.createElement('input');
    Object.assign(a,{type:'number',step:step??'.1',value:value??'',disabled:value===null});
    a.onchange=run(()=>{
      try { if (!Number.isFinite(a.valueAsNumber)) throw Error('Enter a number.'); commit(key,a.valueAsNumber); }
      catch (e) { a.value=value??''; throw e; }
    });
    l.append(a);
    return l;
  }));
}
const descriptors=[['x','X offset'],['y','Y offset'],['angle','Rotation °'],['sx','Width scale','.001'],['sy','Height scale','.001'],['cx','Pivot X'],['cy','Pivot Y']];
function populate() {
  numFields('affine',descriptors.map(([k,l,s])=>[k,l,state.fit.affine[k],s]),(k,v)=>edit(f=>f.affine[k]=v));
  $('uniform').value=state.fit.affine.sx===state.fit.affine.sy?state.fit.affine.sx:'';
  const name=$('landmark').value;
  const b=(state.baseEdit??base()?.points??{})[name];
  const baseEditable=state.files.skin && !Object.keys(history.approvals).some(k=>{
    const [body,,pose]=k.split('/'); return body+'/'+pose===baseKey();
  });
  numFields('baseNumbers',[['0','Body X',baseEditable?(b?.[0]??0):null],['1','Body Y',baseEditable?(b?.[1]??0):null]],(i,v)=>{
    const p=[...(b??[0,0])]; p[i]=v; setBase(p);
  });
  options('pins',state.fit.pins.map((p,i)=>[String(i),p.name]),String(state.selectedPin));
  const pin=state.fit.pins[state.selectedPin];
  const fields=[['s0','Source X',pin?.source[0]],['s1','Source Y',pin?.source[1]],['t0','Target X',pin?.target[0]],['t1','Target Y',pin?.target[1]],['r','Support radius',pin?.radius]];
  numFields('pinNumbers',fields.map(([k,l,v])=>[k,l,v??null]),(k,v)=>edit(f=>{
    const p=f.pins[state.selectedPin];
    if (k==='r') p.radius=v;
    else p[k[0]==='s'?'source':'target'][Number(k[1])]=v;
  }));
  options('nodes',state.fit.mask.map((_,i)=>[String(i),'Node '+(i+1)]),String(state.selectedNode));
  const node=state.fit.mask[state.selectedNode];
  numFields('nodeNumbers',[['0','Curve X',node?.[0]??null],['1','Curve Y',node?.[1]??null]],
    (k,v)=>edit(f=>f.mask[state.selectedNode][Number(k)]=v));
  options('history',history.revisions.filter(r=>r.key===keyOf(active())).map(r=>[r.id,(r.owner?'Locked · ':'Draft · ')+r.created]),$('history').value);
  $('undo').disabled=!canFit()||!state.before.length;
  $('redo').disabled=!canFit()||!state.after.length;
  $('reset').disabled=!canFit();
  $('save').disabled=!canFit();
  $('approve').disabled=!canFit()||!state.check?.pass||!completeBase();
  $('gate').textContent=approved()?'Locked after owner review. Reopen the accepted revision below.':canFit()?'Current fit. Owner approval and a passing check advance the queue.':'View-only. Current fit: '+(nextEntry(history.approvals)?keyOf(nextEntry(history.approvals)):'all complete');
}
$('uniform').onchange=run(()=>edit(f=>f.affine.sx=f.affine.sy=$('uniform').valueAsNumber));
$('landmark').onchange=()=>{populate(); draw();};
$('pins').onchange=()=>{state.selectedPin=Number($('pins').value); populate(); draw();};
$('nodes').onchange=()=>{state.selectedNode=Number($('nodes').value); populate(); draw();};
function setBase(p) {
  if (!state.files.skin || p.some(v=>!Number.isFinite(v)||v<0||v>=SIZE)) throw Error('Load the exact body and select a point inside the canvas.');
  if (Object.keys(history.approvals).some(k=>{
    const [body,,pose]=k.split('/'); return body+'/'+pose===baseKey();
  })) throw Error('A locked fit uses this base configuration.');
  state.baseEdit??=clone(base()?.points??{});
  state.baseEdit[$('landmark').value]=p;
  refresh();
}
function completeBase() {
  return base()?.skinSha256===state.files.skin?.sha && !state.baseEdit && ANATOMY.every(n=>base()?.points[n]);
}
$('saveBase').onclick=run(()=>{
  if (!state.files.skin || !state.baseEdit) throw Error('Author at least one landmark on a loaded body.');
  history.bases[baseKey()]={version:1,body:active().body,pose:active().pose,skinSha256:state.files.skin.sha,points:state.baseEdit};
  state.baseEdit=null; persist(); invalidate(); refresh();
  message(completeBase()?'Complete base configuration saved.':'Partial base configuration saved. Continue marking the anatomy.');
});
$('downloadBase').onclick=run(()=>{
  if (!base()) throw Error('Save the base landmarks first.');
  download(new Blob([JSON.stringify(base(),null,2)],{type:'application/json'}),baseKey().replace('/','-')+'.landmarks.json');
});
function sourcePoint(p) {
  const warp=compile(state.fit);
  return displaySource()?p:warp.inverse(...p);
}
function updatePin(source) {
  const name=$('landmark').value;
  const target=base()?.points[name];
  if (!target || !state.files.front) throw Error('Load hair and save the matching body landmark first.');
  const i=state.addingSection?-1:state.fit.pins.findIndex(p=>p.name===name);
  state.addingSection=false;
  state.selectedPin=i<0?state.fit.pins.length:i;
  edit(f=>{
    if (i<0) f.pins.push({name:f.pins.some(p=>p.name===name)?name+' #'+(f.pins.length+1):name,source,target:compile(f).move(source),radius:130});
    else f.pins[i].source=source;
  });
  message('Source correspondence set. Move its target or use Target landmark.');
}
$('addPin').onclick=run(()=>{
  if (!canFit()) throw Error('This fit is view-only.');
  state.addingSection=true;
  $('tool').value='source';
  message('Click the original strand or contact point. Show before displays source coordinates.');
});
$('removePin').onclick=run(()=>edit(f=>{
  f.pins.splice(state.selectedPin,1);
  state.selectedPin=Math.max(0,Math.min(state.selectedPin,f.pins.length-1));
}));
$('snapPin').onclick=run(()=>edit(f=>{
  const pin=f.pins[state.selectedPin]; const dest=base()?.points[$('landmark').value];
  if (!pin||!dest) throw Error('Select a hair section and a saved body landmark.');
  pin.target=dest;
}));
$('removeNode').onclick=run(()=>edit(f=>{f.mask.splice(state.selectedNode,1);state.selectedNode=Math.max(0,state.selectedNode-1);}));
$('clearMask').onclick=run(()=>edit(f=>f.mask=[]));
$('undo').onclick=run(()=>{state.after.push(clone(state.fit));applyFit(state.before.pop(),false);});
$('redo').onclick=run(()=>{state.before.push(clone(state.fit));applyFit(state.after.pop(),false);});
$('reset').onclick=run(()=>applyFit(clone(brownRevision()?.fit??fresh())));
for(const [k,l] of Object.entries({body:'Body',front:'Front hair',back:'Back hair',landmarks:'Landmarks',scalp:'Red scalp mask',grid:'Grid',centerline:'Centerline',split:'Curve',flags:'Checker spots'})){
  const label=document.createElement('label'), input=document.createElement('input');
  Object.assign(input,{type:'checkbox',checked:display[k]}); label.append(input,' '+l); $('layers').append(label);
  input.onchange=()=>{display[k]=input.checked; draw();};
}
for(const id of ['background','opacity','baseline']) $(id).oninput=draw;
const clip=(x,min,max)=>Math.max(min,Math.min(max,x));
function union(a,b) {
  if (!a||!b) return a??b;
  return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])];
}
function renderFit() {
  if (!state.dirty) return;
  state.dirty=false; state.planes=null; state.raster=null;
  if (state.files.front) {
    const {front,back}=state.files;
    const mask=buffer(), m=mask.getContext('2d',{willReadFrequently:true});
    let maskData=null;
    if (traceMask(m,state.fit.mask)) { m.fill('evenodd'); maskData=m.getImageData(0,0,SIZE,SIZE).data; }
    const p=raster({front:front.data,back:back?.data,box:union(front.box,back?.box),mask:maskData},compile(state.fit));
    state.raster=p;
    state.planes={front:imageCanvas(p.front),back:imageCanvas(p.back)};
  }
}
function composite(g,before=false,exportMode=false) {
  const layers=before?{front:state.files.front?.image,back:state.files.back?.image}:state.planes;
  const opacity=exportMode?1:Number($('opacity').value)/100;
  if (layers?.back && (exportMode||display.back)) {g.globalAlpha=opacity;g.drawImage(layers.back,0,0);}
  g.globalAlpha=1;
  if (state.files.skin && (exportMode||display.body)) g.drawImage(state.files.skin.image,0,0);
  if (!exportMode && display.scalp && state.files.scalp) {
    const c=state.files.scalp.red??=(()=>{
      const r=buffer(), rc=r.getContext('2d'); rc.drawImage(state.files.scalp.image,0,0);
      rc.globalCompositeOperation='source-in';rc.fillStyle='rgba(255,35,47,.72)';rc.fillRect(0,0,SIZE,SIZE);return r;
    })();
    g.drawImage(c,0,0);
  }
  if (layers?.front && (exportMode||display.front)) {g.globalAlpha=opacity;g.drawImage(layers.front,0,0);}
  g.globalAlpha=1;
}
function headRegion() {
  const rig=state.rig?.data;
  const slot=active();
  if (rig) return (rig.zonesBy?.[slot.pose+'/'+slot.body]?.head??rig.zones.head).map(v=>v*(rig.sourceSize??rig.canvas)/rig.canvas);
  const pts=Object.entries(base()?.points??{}).filter(([k])=>!k.includes('shoulder')&&!k.includes('neck')).map(([,v])=>v);
  if (pts.length>=6) return [Math.min(...pts.map(p=>p[0]))-55,Math.min(...pts.map(p=>p[1]))-55,Math.max(...pts.map(p=>p[0]))+55,Math.max(...pts.map(p=>p[1]))+45];
  return [0,0,SIZE,SIZE];
}
const definitions={
  Body:null,Head:null,'Left ear':'viewer-left ear center','Right ear':'viewer-right ear center',
  Forehead:'forehead','Left temple':'viewer-left temple','Right temple':'viewer-right temple',Jaw:'chin'
};
function region(name) {
  if(name==='Body') return [0,0,SIZE,SIZE];
  if(name==='Head') return headRegion();
  const p=(state.baseEdit??base()?.points)?.[definitions[name]];
  if (!p) return null;
  const r=name==='Forehead'||name==='Jaw'?100:66;
  return [p[0]-r,p[1]-r,p[0]+r,p[1]+r];
}
function focusView(name) {
  if(!region(name)) throw Error('Save the corresponding anatomical landmark to use this view.');
  state.view=name; state.zoom=1; state.pan=[0,0];
  for (const b of $('views').children) b.setAttribute('aria-pressed',String(b.textContent===name));
  draw(); preview();
}
for (const name of Object.keys(definitions)) {
  const b=document.createElement('button');b.textContent=name;b.onclick=run(()=>focusView(name));$('views').append(b);
}
const displaySource=()=>$('baseline').checked;
function frame() {
  const r=region(state.view)??region('Body');
  const s=Math.min(canvas.width/(r[2]-r[0]),canvas.height/(r[3]-r[1]))*state.zoom;
  return [s,(canvas.width-(r[0]+r[2])*s)/2+state.pan[0],(canvas.height-(r[1]+r[3])*s)/2+state.pan[1]];
}
function dots(g, scale, showAll=false) {
  const marker=(p,color,label)=>{
    g.fillStyle=color;g.strokeStyle='#121923';g.lineWidth=1/scale;
    g.beginPath();g.arc(...p,4/scale,0,Math.PI*2);g.fill();g.stroke();
    if (label) {g.font=(12/scale)+'px system-ui';g.strokeText(label,p[0]+7/scale,p[1]-4/scale);g.fillText(label,p[0]+7/scale,p[1]-4/scale);}
  };
  const points=state.baseEdit??base()?.points??{};
  if (display.centerline&&points['centerline top']&&points['centerline bottom']) {
    g.strokeStyle='#7af1da';g.lineWidth=1/scale;g.beginPath();g.moveTo(...points['centerline top']);g.lineTo(...points['centerline bottom']);g.stroke();
  }
  if (display.landmarks||showAll) for(const [n,p] of Object.entries(points)) marker(p,'#49f0cb',n===$('landmark').value?n:null);
  const warp=compile(state.fit);
  if (display.landmarks||showAll) for(const [i,p] of state.fit.pins.entries()){
    const actual=warp.forward(p.source);
    const colour=i===state.selectedPin?'#fff0ab':'#ffd678';
    if (!displaySource()||showAll) {
      g.strokeStyle=colour;g.lineWidth=1/scale;g.beginPath();g.moveTo(...actual);g.lineTo(...p.target);g.stroke();
      marker(actual,'#eef1f6',null);
    }
    marker(displaySource()&&!showAll?p.source:p.target,colour,i===state.selectedPin?p.name:null);
  }
  if (display.split&&!showAll && state.fit.mask.length) {
    const place=p=>displaySource()?p:warp.forward(p);
    g.strokeStyle='#f789db';g.lineWidth=1.5/scale;
    const nodes=state.fit.mask;
    if (nodes.length>=3) {
      const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
      g.beginPath();g.moveTo(...place(mid(nodes.at(-1),nodes[0])));
      nodes.forEach((p,i)=>{
        const a=mid(nodes[(i+nodes.length-1)%nodes.length],p),b=mid(p,nodes[(i+1)%nodes.length]);
        for(let j=1;j<=16;j++){const t=j/16,s=1-t;g.lineTo(...place([s*s*a[0]+2*s*t*p[0]+t*t*b[0],s*s*a[1]+2*s*t*p[1]+t*t*b[1]]));}
      });
      g.closePath();g.stroke();
    }
    nodes.forEach((p,i)=>marker(place(p),i===state.selectedNode?'#fff0ab':'#f789db',null));
  }
  if(display.flags&&!displaySource()&&!showAll) for (const [level,box] of state.check?.result?.spots??[]) {
    g.strokeStyle=level==='fail'?'#ff4949':'#ffb647';g.lineWidth=2/scale;g.strokeRect(box[0],box[1],box[2]-box[0],box[3]-box[1]);
  }
  if(display.flags&&!displaySource()&&!showAll&&state.check?.inspection) {
    g.strokeStyle='#86cbff';g.lineWidth=1.5/scale;g.setLineDash([4/scale,3/scale]);
    for(const {box} of [...state.check.inspection.fragments,...state.check.inspection.paleEdge]) {
      g.strokeRect(box[0],box[1],box[2]-box[0],box[3]-box[1]);
    }
    g.setLineDash([]);
  }
}
function draw() {
  const [s,x,y]=frame();
  const bg=$('background').value;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle=bg==='checker'?'#263441':bg;ctx.fillRect(0,0,canvas.width,canvas.height);
  if(bg==='checker'){
    ctx.fillStyle='#3b4b5b';const d=18*Math.max(1,devicePixelRatio);
    for(let j=0;j*d<canvas.height;j++)for(let i=j%2;i*d<canvas.width;i+=2)ctx.fillRect(i*d,j*d,d,d);
  }
  ctx.setTransform(s,0,0,s,x,y);ctx.imageSmoothingEnabled=s<2;
  composite(ctx,displaySource());
  if (display.grid) {
    ctx.strokeStyle='#94a6b170';ctx.lineWidth=1/s;ctx.beginPath();
    for(let i=0;i<=SIZE;i+=32){ctx.moveTo(i,0);ctx.lineTo(i,SIZE);ctx.moveTo(0,i);ctx.lineTo(SIZE,i);}ctx.stroke();
  }
  dots(ctx,s);
  ctx.setTransform(1,0,0,1,0,0);
}
function reviewCanvas(view,before=false,overlay=false) {
  const r=region(view);
  if (!r) throw Error('Missing anatomical coordinates for '+view+'.');
  const [x0,y0,x1,y1]=r;
  const ratio=view==='Body'?1:Math.max(1,Math.min(3,580/Math.max(x1-x0,y1-y0)));
  const c=buffer(Math.ceil((x1-x0)*ratio),Math.ceil((y1-y0)*ratio)),g=c.getContext('2d');
  g.fillStyle='#e8f0f4';g.fillRect(0,0,c.width,c.height);
  g.setTransform(ratio,0,0,ratio,-x0*ratio,-y0*ratio);
  composite(g,before,true);
  if(overlay) dots(g,ratio,true);
  return c;
}
function preview() {
  for (const [id,before] of [['before',true],['after',false]]) {
    const source=reviewCanvas(state.view in definitions && region(state.view)?state.view:'Body',before);
    const c=$(id);c.width=360;c.height=290;
    const s=Math.min(360/source.width,290/source.height);
    c.getContext('2d').drawImage(source,(360-s*source.width)/2,(290-s*source.height)/2,s*source.width,s*source.height);
  }
}
function refresh() {
  renderFit(); populate(); draw(); preview();
  const w=compile(state.fit);
  const errors=state.fit.pins.map(p=>Math.hypot(...w.forward(p.source).map((v,i)=>v-p.target[i])));
  $('metrics').textContent=(errors.length?'Largest correspondence residual '+Math.max(...errors).toFixed(2)+' px. ':'')+'Local gradient bound '+w.gradient.toFixed(3)+'.';
  showReport();
}
new ResizeObserver(()=>{
  const r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*devicePixelRatio);canvas.height=Math.round(r.height*devicePixelRatio);draw();
}).observe(canvas);
function eventPoint(e) {
  const b=canvas.getBoundingClientRect();
  const x=(e.clientX-b.left)*canvas.width/b.width,y=(e.clientY-b.top)*canvas.height/b.height;
  const [s,tx,ty]=frame();
  return {screen:[x,y],native:[(x-tx)/s,(y-ty)/s]};
}
function zoom(factor,around=[canvas.width/2,canvas.height/2]) {
  const old=state.zoom;
  state.zoom=clip(state.zoom*factor,.2,30);
  const k=state.zoom/old;
  const center=[canvas.width/2,canvas.height/2];
  state.pan=state.pan.map((v,i)=>k*v+(1-k)*(around[i]-center[i]));
  draw();
}
$('minus').onclick=()=>zoom(.8); $('plus').onclick=()=>zoom(1.25);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0016),eventPoint(e).screen);},{passive:false});
let drag=null;
function nearest(points,p) {
  const [s]=frame();let best=-1, d=16*devicePixelRatio;
  for (const [i,q] of points.entries()){const n=Math.hypot(q[0]-p[0],q[1]-p[1])*s;if(n<d){d=n;best=i;}}
  return best;
}
canvas.onpointerdown=run(e=>{
  const p=eventPoint(e), tool=$('tool').value;
  if (e.button===1||e.button===2||tool==='pan') drag={mode:'pan',screen:p.screen,pan:state.pan.slice()};
  else if(tool==='base') setBase(p.native.map(v=>Math.round(v*10)/10));
  else if(tool==='source') updatePin(sourcePoint(p.native).map(v=>Math.round(v*10)/10));
  else if(tool==='pin'&&canFit()&&!displaySource()){
    const i=nearest(state.fit.pins.map(pin=>pin.target),p.native);
    if(i>=0&&!brownRevision()){state.selectedPin=i;drag={mode:'pin',original:clone(state.fit)};populate();}
  } else if(tool==='mask'&&canFit()){
    const w=compile(state.fit);
    const i=nearest(state.fit.mask.map(n=>displaySource()?n:w.forward(n)),p.native);
    if(i>=0){state.selectedNode=i;drag={mode:'mask',original:clone(state.fit)};populate();}
    else if(state.fit.mask.length<128){state.selectedNode=state.fit.mask.length;edit(f=>f.mask.push(sourcePoint(p.native)));}
  }
  if(drag) canvas.setPointerCapture(e.pointerId);
});
canvas.oncontextmenu=e=>e.preventDefault();
canvas.onpointermove=e=>{
  const p=eventPoint(e);
  $('coords').textContent='x '+p.native[0].toFixed(1)+' / y '+p.native[1].toFixed(1);
  if(!drag)return;
  if(drag.mode==='pan'){state.pan=p.screen.map((v,i)=>drag.pan[i]+v-drag.screen[i]);draw();return;}
  const draft=clone(drag.original);
  if(drag.mode==='pin') draft.pins[state.selectedPin].target=p.native;
  else draft.mask[state.selectedNode]=sourcePoint(p.native);
  try {compile(draft);state.fit=draft;drag.changed=true;draw();}
  catch(e){message(e.message);}
};
canvas.onpointerup=()=>{
  if(drag?.changed){state.before.push(drag.original);if(state.before.length>60)state.before.shift();state.after=[];invalidate();refresh();}
  drag=null;
};
canvas.onpointercancel=()=>{if(drag?.original){state.fit=drag.original;draw();}drag=null;};
canvas.onkeydown=e=>{
  if (e.key==='+'||e.key==='=') zoom(1.25);
  if (e.key==='-') zoom(.8);
};

function showReport() {
  const c=state.check;
  if(!c){$('report').textContent='No result for this revision.';return;}
  const r=c.result;
  const lines=[c.pass?'PASS · expected selection checked':'FAIL · review checker output',...(c.issues??[])];
  if(c.inspection)lines.push('Inspection hints: '+c.inspection.fragments.length+' detached regions; '+c.inspection.paleEdge.length+' pale edge regions.');
  if(r)lines.push('Exposed scalp '+r.bald_pct+'%','Longest straight edge '+r.longest_edge+' px',
    'Median Lab '+(r.lab?.join(', ')??'unavailable'),'Cross-color overlap '+(r.overlap_with_ref??'requires multiple colors'),
    ...r.fail.map(m=>'FAIL '+m),...r.warn.map(m=>'WARN '+m));
  if(c.stdout)lines.push(c.stdout.trim());
  $('report').textContent=lines.join('\n');
}
function requireSources() {
  for(const k of ['skin','scalp','front'])if(!state.files[k])throw Error('Load the approved body, scalp mask and hair source.');
  if (!state.rig) throw Error('Load the verified candidate rig.');
  for(const [k,v] of Object.entries(state.expected?.sourceSha256??{})) if(state.files[k]?.sha!==v) throw Error('Reload exact '+k+' source bytes.');
  if (state.expected && Object.keys(state.files).some(k=>!state.expected.sourceSha256[k])) throw Error('Reopen the workspace with only the inputs recorded in this revision.');
}
async function capture() {
  requireSources();renderFit();
  const front=new Blob([rgbaPng(state.raster.front)],{type:'image/png'});
  const back=new Blob([rgbaPng(state.raster.back)],{type:'image/png'});
  const outputSha256=Object.fromEntries(await Promise.all(Object.entries({front,back}).map(async ([k,b])=>[k,await sha256(await b.arrayBuffer())])));
  return {front,back,outputSha256};
}
function record(output,owner=null) {
  return {version:1,key:keyOf(active()),selection:active(),id:crypto.randomUUID(),created:new Date().toISOString(),
    fit:clone(state.fit),landmarks:clone(base()??null),notes:$('notes').value,owner,
    sourceSha256:Object.fromEntries(Object.entries(state.files).map(([k,v])=>[k,v.sha])),
    rigSha256:state.rig.sha,outputSha256:output.outputSha256,
    checker:state.check?{pass:state.check.pass,sha256:state.check.checkerSha256}:null};
}
async function bodyFor(output) {
  const input={skin:state.files.skin.blob,scalp:state.files.scalp.blob,rig:state.rig.blob,front:output.front,back:output.back};
  return {selection:active(),files:Object.fromEntries(await Promise.all(Object.entries(input).map(async ([k,v])=>[k,await encode(v)])))};
}
async function request(route,body) {
  const res=await fetch(route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok)throw Error((await res.json()).error??'Studio server rejected the request.');
  return res;
}
async function verifyOutput(output) {
  const expected=state.expected?.outputSha256;
  if(expected && JSON.stringify(state.fit)===JSON.stringify(state.expected.fit) &&
      ['front','back'].some(k=>expected[k]!==output.outputSha256[k]))throw Error('Saved fit output hashes differ in this browser. Use the original engine and inputs.');
}
let busy=false;
function job(fn) {
  return run(async ()=>{
    if(busy)return;
    busy=true;
    const ui=document.querySelector('main');ui.inert=true;
    try {await fn();}finally{busy=false;ui.inert=false;}
  });
}
$('validate').onclick=job(async ()=>{
  message('Running the original hair checker…');
  const result=await capture(); await verifyOutput(result);
  state.check=await (await request('/check',await bodyFor(result))).json();
  state.check.outputSha256=result.outputSha256;
  refresh();message(state.check.pass?'Checker passed. Review the real composite before approval.':'Checker reported issues.');
});
function saveRevision(r) {
  history.revisions.push(r);
  if(r.owner)history.approvals[r.key]=r.id;
  persist();refresh();$('history').value=r.id;
}
$('save').onclick=job(async ()=>{
  if(!canFit())throw Error('This fit is view-only.');
  const out=await capture();await verifyOutput(out);
  saveRevision(record(out));message('Draft revision saved.');
});
function loadRevision(r) {
  if(!r||r.version!==1||r.key!==keyOf(r.selection)||!ORDER.some(e=>keyOf(e)===r.key))throw Error('Invalid fit revision.');
  compile(r.fit);
  if(!Array.isArray(r.fit.mask)||r.fit.mask.length>128||r.fit.mask.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v))))throw Error('Invalid fit path.');
  useEntry(r.selection);changeEntry();
  if(r.landmarks) {
    const current=base();
    if(current && JSON.stringify(current)!==JSON.stringify(r.landmarks))throw Error('The workspace has a different saved base configuration.');
    importBase(r.landmarks);
  }
  state.fit=clone(r.fit);state.expected=r;$('notes').value=r.notes??'';
  invalidate();refresh();message('Revision loaded. Select the exact body, hair, mask and rig to reproduce it.');
}
$('load').onclick=run(()=>loadRevision(history.revisions.find(r=>r.id===$('history').value)));
function importBase(data) {
  const points=data?.points;
  const id=data?.body+'/'+data?.pose;
  if(data?.version!==1||!Object.hasOwn(STYLES,data.body)||!POSES.includes(data.pose)||
     !/^[a-f0-9]{64}$/.test(data.skinSha256)||!points||
     Object.entries(points).some(([k,v])=>!ANATOMY.includes(k)||!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n)||n<0||n>=SIZE)))throw Error('Invalid anatomy configuration.');
  if(id===baseKey()&&state.files.skin&&state.files.skin.sha!==data.skinSha256)throw Error('Landmarks were measured on different body bytes.');
  const saved=history.bases[id];
  const locked=Object.keys(history.approvals).some(k=>{const [b,,p]=k.split('/');return b+'/'+p===id;});
  if (locked&&JSON.stringify(saved)!==JSON.stringify(data)) throw Error('A locked fit uses this anatomy configuration.');
  history.bases[id]=data;persist();
}
$('importFile').onchange=run(async ()=>{
  const f=$('importFile').files[0];if(!f)return;
  const data=JSON.parse(await f.text());
  if(data.fit)loadRevision(data);
  else {importBase(data);refresh();message('Base configuration imported.');}
});
$('approve').onclick=job(async ()=>{
  const owner=$('owner').value.trim();
  if(!owner||!canFit()||!completeBase()||!state.check?.pass) throw Error('Locking requires the current fit, complete base landmarks, a passing checker and an explicit owner review reference.');
  if(active().style==='girl-ponytail'&&active().pose==='front') {
    const names=new Set(state.fit.pins.map(p=>p.name));
    const required=['viewer-left','viewer-right'].flatMap(side=>['temple','ear center','cheek'].map(k=>side+' '+k));
    if(required.some(n=>!names.has(n)))throw Error('Record bilateral ponytail correspondence at the temples, ear openings and face-framing locks.');
  }
  const brown=brownRevision();
  if(brown&&!sameTargets(state.fit,brown.fit))throw Error('Color variants must preserve the accepted brown destinations.');
  const out=await capture();
  if(['front','back'].some(k=>out.outputSha256[k]!==state.check.outputSha256[k]))throw Error('Run the checker on these exact PNGs before locking.');
  saveRevision(record(out,owner));message('Revision locked. Select the next approved-sequence workspace.');
});
$('export').onclick=job(async ()=>{
  message('Building review package…');
  const out=await capture();await verifyOutput(out);
  const body=await bodyFor(out);
  const locked=history.revisions.find(r=>r.id===approved());
  if(locked&&['front','back'].some(k=>locked.outputSha256[k]!==out.outputSha256[k]))throw Error('Reopen the approved revision before exporting this fit.');
  body.revision=locked??(state.expected?.owner ? state.expected : record(out));
  body.review=Object.fromEntries(await Promise.all([
    ['before-body','Body',true],['after-body','Body'],['before-head','Head',true],['after-head','Head'],
    ['left-ear','Left ear'],['right-ear','Right ear'],['forehead','Forehead'],['left-temple','Left temple'],['right-temple','Right temple'],['jaw','Jaw'],['landmark-overlay','Head',false,true]
  ].filter(([,view])=>region(view)).map(async ([name,view,before,overlay])=>[name,await encode(await png(reviewCanvas(view,before,overlay)))])));
  const res=await request('/export',body);
  download(await res.blob(),active().style+'-'+active().pose+'-'+active().color+'-review.zip');
  message('Review ZIP ready.');
});
focusView('Body');refresh();message('Load the exact body, scalp mask, original hair and candidate rig.');
