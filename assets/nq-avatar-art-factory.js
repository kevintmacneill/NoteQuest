/* M6 painted avatar compositor. Accepts a complete approved manifest, or an approved
   partial one (scope:'partial') listing only the art that exists so far. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NoteQuestAvatarArtFactory=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const POSES=Object.freeze(['front','wave','walk']);
 const PARTS=Object.freeze(['body','hair','skin','eyeColor','hairColor','outfit','accessory']);
 const safePath=p=>typeof p==='string'&&/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.webp$/i.test(p);
 const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
 const list=(o,k)=>own(o,k)?o[k]:undefined;
 // Engine 1.9.0: more than one accessory, one per spot. `accessories` wins when present;
 // an older look has only `accessory` ('acc-none' = nothing).
 const spotOf=(c,id)=>c.accessorySlot?.[id]||id;
 const worn=l=>Array.isArray(l?.accessories)?l.accessories:(!l?.accessory||l.accessory==='acc-none'?[]:[l.accessory]);
 function wornValid(c,l){
   if(!Array.isArray(l.accessories)&&!c.accessory?.includes(l.accessory))return false;
   const spots=new Set();
   return worn(l).every(id=>id!=='acc-none'&&c.accessory.includes(id)&&!spots.has(spotOf(c,id))&&spots.add(spotOf(c,id)));
 }
 // Engine 1.10.0: eye color. The base color (brown) is painted into the bases and needs no
 // layer; a look saved before 1.10.0 has no eyeColor and shows the base color.
 const eyeOf=(c,l)=>l?.eyeColor??c?.eyeColorBase;
 const eyeIds=c=>(c?.eyeColor||[]).filter(id=>id!==c.eyeColorBase);
 const eyesValid=(c,l)=>c.eyeColor?c.eyeColor.includes(eyeOf(c,l)):l.eyeColor===undefined;
 function validLook(c,l){
   return !!c&&l?.v===c.v&&c.body.includes(l.body)&&c.hair[l.body]?.includes(l.hair)&&
     ['skin','hairColor','outfit'].every(k=>c[k]?.includes(l[k]))&&eyesValid(c,l)&&wornValid(c,l);
 }
 // Accessories stack by spot: the backpack sits furthest back, the hat on top (over glasses).
 const SPOT_ORDER=['back','chest','neck','face','head'];
 const drawOrder=(c,ids)=>ids.slice().sort((a,b)=>SPOT_ORDER.indexOf(spotOf(c,a))-SPOT_ORDER.indexOf(spotOf(c,b)));
 // Canonical look: accessories in catalog order, `accessory` = the first one (for older readers).
 function withWorn(c,l,ids){
   const list=c.accessory.filter(id=>ids.includes(id));
   return {...l,accessory:list[0]||'acc-none',accessories:list};
 }
 // Assets are keyed explicitly, never synthesized from learner data. Back/front
 // planes share the pose canvas and anchors. null explicitly denotes an empty plane.
 const planeValid=p=>!!p&&own(p,'back')&&own(p,'front')&&[p.back,p.front].every(v=>v===null||safePath(v))&&(p.back!==null||p.front!==null);
 function swatchPath(m,c,l,field){
   if(!validLook(c,l)||!PARTS.includes(field))return null;
   const group=list(m?.swatches,field);
   const p=field==='hair'?list(list(group,l.body),l.hair):list(group,l[field]);
   return safePath(p)?p:null;
 }
 function layers(m,c,l,pose){
   if(!validLook(c,l)||!POSES.includes(pose))return null;
   const p=list(m?.poses,pose),body=list(p?.bodies,l.body);
   const hair=list(list(body?.hair,l.hair),l.hairColor);
   const accs=drawOrder(c,worn(l)).map(id=>accPlane(list(body?.accessory,id),l.outfit));
   const skin=list(body?.skin,l.skin),outfit=list(body?.outfit,l.outfit);
   const eye=eyeOf(c,l),eyes=!c.eyeColor||eye===c.eyeColorBase?null:list(body?.eyes,eye);
   if(!planeValid(hair)||!accs.every(planeValid)||!safePath(skin)||!safePath(outfit)||(eyes===undefined||eyes!==null&&!safePath(eyes)))return null;
   // Eyes go over the skin and under the fringe and glasses.
   return [hair.back,...accs.map(a=>a.back),skin,eyes,outfit,hair.front,...accs.map(a=>a.front)].filter(p=>p!==null);
 }
 // Outfit-matched accessories (owner 2026-11-26: goggle lenses match the outfit color, each
 // variant hand-painted): such an entry is {byOutfit:{<outfit>:{back,front}}} and is only
 // available for outfits with a painted variant. Others are a single {back,front} plane.
 const accPlane=(node,outfit)=>node&&own(node,'byOutfit')?list(node.byOutfit,outfit):node;
 function accNodeValid(c,node,complete){
   if(!node||!own(node,'byOutfit'))return planeValid(node);
   const v=node.byOutfit;
   if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(node).length!==1)return false;
   const ids=Object.keys(v);
   return ids.length>0&&ids.every(o=>c.outfit.includes(o)&&planeValid(v[o]))&&(!complete||c.outfit.every(o=>own(v,o)));
 }
 const bodyNode=(m,pose,body)=>list(list(m?.poses,pose)?.bodies,body);
 // Art is painted front pose first (owner sequence 2026-11-26), so in a partial manifest a
 // choice is available once its front pose is approved; wave and walk fall back to front
 // until they're painted. A complete manifest has every pose.
 const needed=m=>m?.scope==='partial'?['front']:POSES;
 // Is one part painted for this body in the needed poses? Hair is painted per style and color.
 function partOK(m,c,body,part,id,color){
   if(!c?.body?.includes(body))return false;
   return needed(m).every(pose=>{
     const b=bodyNode(m,pose,body);
     if(part==='skin'||part==='outfit')return c[part].includes(id)&&safePath(list(list(b,part),id));
     if(part==='accessory')return c.accessory.includes(id)&&(id==='acc-none'||planeValid(accPlane(list(list(b,'accessory'),id),color)));
     if(part==='hair')return c.hair[body].includes(id)&&c.hairColor.includes(color)&&planeValid(list(list(list(b,'hair'),id),color));
     if(part==='eyeColor')return !!c.eyeColor?.includes(id)&&(id===c.eyeColorBase||safePath(list(list(b,'eyes'),id)));
     return false;
   });
 }
 function renderable(m,c,l){return validLook(c,l)&&needed(m).every(p=>layers(m,c,l,p)!==null)}
 // The nearest look with art in every pose that keeps `locked` (and the body) as chosen,
 // or null when that choice isn't painted yet. Unlocked parts keep their current value when
 // it is painted, otherwise take the first painted option in catalog order.
 function fit(m,c,look,locked){
   if(!validLook(c,look))return null;
   const l={...look},b=l.body,keep=(field,ok)=>{if(locked!==field&&!ok(l[field]))l[field]=c[field].find(ok)??l[field]};
   keep('skin',id=>partOK(m,c,b,'skin',id));
   keep('outfit',id=>partOK(m,c,b,'outfit',id));
   if(c.eyeColor&&locked!=='eyeColor'&&!partOK(m,c,b,'eyeColor',eyeOf(c,l)))l.eyeColor=c.eyeColorBase;
   if(locked!=='accessory')Object.assign(l,withWorn(c,l,worn(l).filter(id=>partOK(m,c,b,'accessory',id,l.outfit))));
   const hairOK=(h,col)=>partOK(m,c,b,'hair',h,col);
   if(!hairOK(l.hair,l.hairColor)){
     const color=c.hairColor.find(col=>hairOK(l.hair,col));
     const style=c.hair[b].find(h=>hairOK(h,l.hairColor));
     if(locked==='hair'){if(color)l.hairColor=color}
     else if(locked==='hairColor'){if(style)l.hair=style}
     else if(color)l.hairColor=color;
     else if(style)l.hair=style;
     else for(const h of c.hair[b]){const col=c.hairColor.find(x=>hairOK(h,x));if(col){l.hair=h;l.hairColor=col;break}}
   }
   return renderable(m,c,l)?l:null;
 }
 // Apply one builder choice. Changing body keeps the same hairstyle position when it can.
 function choose(m,c,look,field,id){
   if(!PARTS.includes(field)||!validLook(c,look))return null;
   // Accessories toggle: None clears all; a worn one comes off; a new one replaces whatever
   // is in the same spot.
   if(field==='accessory'){
     if(!c.accessory.includes(id))return null;
     const now=worn(look);
     const ids=id==='acc-none'?[]:now.includes(id)?now.filter(x=>x!==id):[...now.filter(x=>spotOf(c,x)!==spotOf(c,id)),id];
     return fit(m,c,withWorn(c,look,ids),'accessory');
   }
   const next={...look,[field]:id};
   if(field==='body'){
     if(!c.body.includes(id))return null;
     const i=c.hair[look.body].indexOf(look.hair);
     next.hair=c.hair[id][i]??c.hair[id][0];
   }
   return fit(m,c,next,field==='body'?null:field);
 }
 function validatePartial(m,c){
   const errors=[];
   const keys=(o,allowed,label)=>{
     if(o==null)return [];
     if(typeof o!=='object'||Array.isArray(o)){errors.push(label);return []}
     return Object.keys(o).filter(k=>allowed.includes(k)||(errors.push(label+'/'+k),false));
   };
   if(m.width!==512||m.height!==512)errors.push('canvas dimensions');
   if(m.silhouette!=null&&!safePath(m.silhouette))errors.push('silhouette');
   const sw=m.swatches;
   for(const field of keys(sw,PARTS,'swatches')){
     if(field==='hair'){for(const body of keys(sw.hair,c.body,'swatch/hair'))for(const id of keys(sw.hair[body],c.hair[body],'swatch/hair/'+body))if(!safePath(sw.hair[body][id]))errors.push('swatch/hair/'+body+'/'+id)}
     else for(const id of keys(sw[field],c[field]||[],'swatch/'+field))if(!safePath(sw[field][id]))errors.push('swatch/'+field+'/'+id);
   }
   for(const pose of keys(m.poses,POSES,'poses'))for(const body of keys(m.poses[pose]?.bodies,c.body,pose)){
     const p=m.poses[pose].bodies[body],at=pose+'/'+body;
     for(const part of keys(p,['skin','outfit','hair','accessory','eyes'],at)){
       if(part==='eyes'){for(const id of keys(p.eyes,eyeIds(c),at+'/eyes'))if(!safePath(p.eyes[id]))errors.push(at+'/eyes/'+id)}
       else if(part==='hair'){for(const h of keys(p.hair,c.hair[body],at+'/hair'))for(const col of keys(p.hair[h],c.hairColor,at+'/'+h))if(!planeValid(p.hair[h][col]))errors.push(at+'/'+h+'/'+col)}
       else if(part==='accessory'){for(const a of keys(p.accessory,c.accessory.filter(a=>a!=='acc-none'),at+'/accessory'))if(!accNodeValid(c,p.accessory[a],false))errors.push(at+'/'+a)}
       else for(const id of keys(p[part],c[part],at+'/'+part))if(!safePath(p[part][id]))errors.push(at+'/'+id);
     }
   }
   for(const body of c.body){
     const any=c.skin[0]&&fit(m,c,{v:c.v,body,hair:c.hair[body][0],skin:c.skin[0],hairColor:c.hairColor[0],outfit:c.outfit[0],accessory:'acc-none'},null);
     if(!any)errors.push(body+': no complete painted look');
   }
   return errors;
 }
 function validate(m,c){
   if(!m||m.status!=='approved'||m.catalogVersion!==c?.v)return ['unapproved manifest'];
   if(m.scope==='partial'){
     const errors=validatePartial(m,c),crop=m.portrait;
     if(!crop||![crop.x,crop.y,crop.width,crop.height].every(Number.isInteger)||crop.x<0||crop.y<0||crop.width<=0||crop.height<=0||crop.x+crop.width>512||crop.y+crop.height>512)errors.push('portrait crop');
     return errors;
   }
   if(own(m,'scope'))return ['unknown manifest scope'];
   const errors=[];
   if(m.width!==512||m.height!==512)errors.push('canvas dimensions');
   if(!safePath(m.silhouette))errors.push('silhouette');
   for(const field of PARTS){
     if(field==='hair'){for(const body of c.body)for(const id of c.hair[body])if(!safePath(list(list(list(m.swatches,field),body),id)))errors.push('swatch/'+field+'/'+body+'/'+id)}
     else for(const id of c[field]||[])if(!safePath(list(list(m.swatches,field),id)))errors.push('swatch/'+field+'/'+id);
   }
   const crop=m.portrait;
   if(!crop||![crop.x,crop.y,crop.width,crop.height].every(Number.isInteger)||crop.x<0||crop.y<0||crop.width<=0||crop.height<=0||crop.x+crop.width>512||crop.y+crop.height>512)errors.push('portrait crop');
   for(const pose of POSES)for(const body of c.body){
     const p=list(list(m.poses,pose)?.bodies,body);
     for(const skin of c.skin)if(!safePath(list(p?.skin,skin)))errors.push(pose+'/'+body+'/'+skin);
     for(const outfit of c.outfit)if(!safePath(list(p?.outfit,outfit)))errors.push(pose+'/'+body+'/'+outfit);
     for(const hair of c.hair[body])for(const color of c.hairColor)if(!planeValid(list(list(p?.hair,hair),color)))errors.push(pose+'/'+body+'/'+hair+'/'+color);
     for(const acc of c.accessory)if(acc!=='acc-none'&&!accNodeValid(c,list(p?.accessory,acc),true))errors.push(pose+'/'+body+'/'+acc);
     for(const eye of eyeIds(c))if(!safePath(list(p?.eyes,eye)))errors.push(pose+'/'+body+'/eyes/'+eye);
   }
   return errors;
 }
 function assetURL(path,baseURI){
   if(!safePath(path))return null;
   try{const base=new URL(baseURI),u=new URL(path,base);return ['http:','https:'].includes(base.protocol)&&u.origin===base.origin&&u.pathname.startsWith(new URL('assets/',base).pathname)?u.href:null}catch{return null}
 }
 function key(l,pose){return JSON.stringify([l.v,l.body,l.skin,l.eyeColor??null,l.outfit,l.hair,l.hairColor,worn(l).slice().sort().join('+'),pose])}
 function cache(max=32){
   const entries=new Map();
   return Object.freeze({
     get(k,build){
       if(entries.has(k)){const v=entries.get(k);entries.delete(k);entries.set(k,v);return v}
       const v=Promise.resolve().then(build);
       entries.set(k,v);
       v.catch(()=>{if(entries.get(k)===v)entries.delete(k)});
       while(entries.size>max)entries.delete(entries.keys().next().value);
       return v;
     },
     size:()=>entries.size,clear:()=>entries.clear()
   })
 }
 // Dependency injected for browser use and tests. Caller must supply the owner-approved
 // immutable manifest and an actual catalog. A missing/invalid manifest cannot go live.
 function create({manifest,catalog,document,baseURI=document?.baseURI,loadImage,limit=32}){
   const errors=validate(manifest,catalog),memo=cache(limit),requests=new WeakMap();
   const valid=errors.length===0;
   const decode=loadImage||((url)=>new Promise((resolve,reject)=>{
     const img=document.createElement('img');img.onload=()=>resolve(img);img.onerror=()=>reject(Error('avatar layer unavailable'));img.src=url;
   }));
   function ready(c){return valid&&c===catalog}
   function load(p){const u=assetURL(p,baseURI);if(!u)throw Error('invalid avatar path');return decode(u)}
   function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
   async function composite(look,requested){
     const pose=manifest.scope==='partial'&&!layers(manifest,catalog,look,requested)?'front':requested;
     const paths=layers(manifest,catalog,look,pose);
     if(!valid||!paths)throw Error('invalid avatar look or manifest');
     return memo.get(key(look,pose),async()=>{
       const images=await Promise.all(paths.map(load));
       const c=canvas(512,512),ctx=c.getContext('2d');
       if(!ctx)throw Error('canvas unavailable');
       for(const image of images){
         if((image.naturalWidth||image.width)!==512||(image.naturalHeight||image.height)!==512)throw Error('avatar layer dimensions');
         ctx.drawImage(image,0,0);
       }
       return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('avatar encode failed')),'image/webp'));
     });
   }
   // Cache blobs, not DOM nodes or long-lived object URLs. A draw owns its URL until
   // load/error, then revokes it. Revision guard prevents stale asynchronous replacement.
   async function paintSilhouette(target,rev){
     // A partial manifest may have no painted silhouette yet: leave the slot empty rather
     // than invent a placeholder.
     if(manifest.silhouette==null){if(requests.get(target)===rev&&target.isConnected)target.replaceChildren();return}
     const image=await load(manifest.silhouette);
     if(requests.get(target)===rev&&target.isConnected){image.alt='';image.setAttribute('aria-hidden','true');target.replaceChildren(image)}
   }
   async function draw(target,look,pose='front'){
     const rev=(requests.get(target)||0)+1;requests.set(target,rev);
     const actual=pose==='portrait'?'front':pose;
     let url;
     try{
       const blob=await composite({...look},actual);
       if(requests.get(target)!==rev||!target.isConnected)return;
       url=URL.createObjectURL(blob);
       const image=await decode(url);
       if(requests.get(target)!==rev||!target.isConnected)return;
       const crop=pose==='portrait'?manifest.portrait:{x:0,y:0,width:512,height:512};
       const c=canvas(crop.width,crop.height),ctx=c.getContext('2d');
       if(!ctx)throw Error('canvas unavailable');
       ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height);
       c.setAttribute('aria-hidden','true');target.replaceChildren(c);
     }catch(error){
       if(valid&&requests.get(target)===rev&&target.isConnected)await paintSilhouette(target,rev);
       // A silhouette is an honest fallback, not successful artwork. The builder
       // must keep Done disabled and explain the failed preview.
       throw error;
     }finally{if(url)URL.revokeObjectURL(url)}
   }
   async function silhouette(target){
     if(!valid)throw Error('avatar art unavailable');
     const rev=(requests.get(target)||0)+1;requests.set(target,rev);
     await paintSilhouette(target,rev);
   }
   async function swatch(target,look,field){
     const path=swatchPath(manifest,catalog,look,field);
     // No painted swatch yet: show the painted look itself (a head crop, or the whole
     // figure for outfits), never a placeholder or recolor.
     if(valid&&!path&&field!=='accessory'&&renderable(manifest,catalog,look))return draw(target,look,field==='outfit'?'front':'portrait');
     const rev=(requests.get(target)||0)+1;requests.set(target,rev);
     if(!valid||!path)throw Error('invalid avatar swatch');
     const image=await load(path);
     if(requests.get(target)===rev&&target.isConnected){image.alt='';image.setAttribute('aria-hidden','true');target.replaceChildren(image)}
   }
   const partial=valid&&manifest.scope==='partial';
   return Object.freeze({ready,draw,swatch,silhouette,partial,
     choose:(look,field,id)=>valid?choose(manifest,catalog,look,field,id):null,
     fit:look=>valid?fit(manifest,catalog,look,null):null,
     errors:Object.freeze(errors.slice())});
 }
 return Object.freeze({POSES,PARTS,safePath,validLook,worn,layers,swatchPath,validate,partOK,renderable,fit,choose,assetURL,key,cache,create});
});
