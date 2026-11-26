/* M6 foundation: no production art manifest or UI activation in this module. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NoteQuestAvatarArtFactory=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const POSES=Object.freeze(['front','wave','walk']);
 const safePath=p=>typeof p==='string'&&/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.webp$/i.test(p);
 const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
 const list=(o,k)=>own(o,k)?o[k]:undefined;
 function validLook(c,l){
   return !!c&&l?.v===c.v&&c.body.includes(l.body)&&c.hair[l.body]?.includes(l.hair)&&
     ['skin','hairColor','outfit','accessory'].every(k=>c[k]?.includes(l[k]));
 }
 // Assets are keyed explicitly, never synthesized from learner data. Each transparent
 // layer shares its pose canvas and approved anchors. 'none' is the only empty layer.
 function layers(m,c,l,pose){
   if(!validLook(c,l)||!POSES.includes(pose))return null;
   const p=list(m?.poses,pose),body=list(p?.bodies,l.body);
   const paths=[list(body?.skin,l.skin),list(body?.outfit,l.outfit),list(list(body?.hair,l.hair),l.hairColor)];
   if(l.accessory!=='acc-none')paths.push(list(body?.accessory,l.accessory));
   return paths.every(safePath)?paths:null;
 }
 function validate(m,c){
   if(!m||m.status!=='approved'||m.catalogVersion!==c?.v)return ['unapproved manifest'];
   const errors=[];
   if(m.width!==512||m.height!==512)errors.push('canvas dimensions');
   if(!safePath(m.silhouette))errors.push('silhouette');
   const crop=m.portrait;
   if(!crop||![crop.x,crop.y,crop.width,crop.height].every(Number.isInteger)||crop.x<0||crop.y<0||crop.width<=0||crop.height<=0||crop.x+crop.width>512||crop.y+crop.height>512)errors.push('portrait crop');
   for(const pose of POSES)for(const body of c.body){
     const p=list(list(m.poses,pose)?.bodies,body);
     for(const skin of c.skin)if(!safePath(list(p?.skin,skin)))errors.push(pose+'/'+body+'/'+skin);
     for(const outfit of c.outfit)if(!safePath(list(p?.outfit,outfit)))errors.push(pose+'/'+body+'/'+outfit);
     for(const hair of c.hair[body])for(const color of c.hairColor)if(!safePath(list(list(p?.hair,hair),color)))errors.push(pose+'/'+body+'/'+hair+'/'+color);
     for(const acc of c.accessory)if(acc!=='acc-none'&&!safePath(list(p?.accessory,acc)))errors.push(pose+'/'+body+'/'+acc);
   }
   return errors;
 }
 function assetURL(path,baseURI){
   if(!safePath(path))return null;
   try{const base=new URL(baseURI),u=new URL(path,base);return ['http:','https:'].includes(base.protocol)&&u.origin===base.origin&&u.pathname.startsWith(new URL('assets/',base).pathname)?u.href:null}catch{return null}
 }
 function key(l,pose){return JSON.stringify([l.v,l.body,l.skin,l.outfit,l.hair,l.hairColor,l.accessory,pose])}
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
   async function composite(look,pose){
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
   async function draw(target,look,pose='front'){
     const rev=(requests.get(target)||0)+1;requests.set(target,rev);
     const actual=pose==='portrait'?'front':pose;
     const blob=await composite({...look},actual);
     if(requests.get(target)!==rev||!target.isConnected)return;
     const url=URL.createObjectURL(blob);
     try{
       const image=await decode(url);
       if(requests.get(target)!==rev||!target.isConnected)return;
       const crop=pose==='portrait'?manifest.portrait:{x:0,y:0,width:512,height:512};
       const c=canvas(crop.width,crop.height),ctx=c.getContext('2d');
       if(!ctx)throw Error('canvas unavailable');
       ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height);
       c.setAttribute('aria-hidden','true');target.replaceChildren(c);
     }finally{URL.revokeObjectURL(url)}
   }
   async function silhouette(target){
     if(!valid)throw Error('avatar art unavailable');
     const rev=(requests.get(target)||0)+1;requests.set(target,rev);
     const image=await load(manifest.silhouette);
     if(requests.get(target)===rev&&target.isConnected){image.alt='';image.setAttribute('aria-hidden','true');target.replaceChildren(image)}
   }
   return Object.freeze({ready,draw,swatch:(target,look,field)=>draw(target,look,['hair','skin','hairColor','body'].includes(field)?'portrait':'front'),silhouette,errors:Object.freeze(errors.slice())});
 }
 return Object.freeze({POSES,safePath,validLook,layers,validate,assetURL,key,cache,create});
});
