export const SIZE = 1024;
export const POSES = ['front', 'wave', 'walk'];
export const COLORS = ['brown', 'black', 'darkbrown', 'lightbrown', 'auburn', 'ginger', 'blonde', 'platinum'].map(c => 'hc-' + c);
export const STYLES = {
  girl: ['girl-ponytail', 'girl-braids', 'girl-bob', 'girl-curly', 'girl-long', 'girl-buns'],
  boy: ['boy-short', 'boy-curly', 'boy-spiky', 'boy-side', 'boy-buzz', 'boy-wavy'],
};
export const ORDER = COLORS.flatMap(color => POSES.flatMap(pose =>
  Object.entries(STYLES).flatMap(([body, styles]) => styles.map(style => ({body, pose, style, color})))));
export const keyOf = ({body, style, pose, color}) => [body, style, pose, color].join('/');
export const ANATOMY = [
  'crown', 'scalp viewer-left', 'scalp viewer-right', 'centerline top', 'centerline bottom', 'forehead', 'hairline center',
  ...['viewer-left', 'viewer-right'].flatMap(s => ['temple', 'brow inner', 'brow outer', 'ear top', 'ear center',
    'ear upper attachment', 'ear lower attachment', 'ear bottom', 'cheek', 'jaw', 'neck', 'shoulder'].map(n => s + ' ' + n)),
  'chin'
];
export const fresh = () => ({version: 1, affine: {x: 0, y: 0, angle: 0, sx: 1, sy: 1, cx: 512, cy: 300}, pins: [], mask: []});
export const sha256 = async bytes =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');

function point(value) {
  return Array.isArray(value) && value.length === 2 && value.every(v => Number.isFinite(v) && Math.abs(v) <= 4096);
}

export function compile(fit) {
  if (fit.version !== 1) throw Error('Unsupported fit version.');
  const {x,y,angle,sx,sy,cx,cy} = fit.affine;
  if (![x,y,angle,sx,sy,cx,cy].every(Number.isFinite) || sx < .5 || sy < .5 || sx > 2 || sy > 2 ||
      [x,y,angle,cx,cy].some(v => Math.abs(v) > 2048)) throw Error('Affine parameters out of range.');
  const rad = angle * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const move = ([a,b]) => [cx+x+c*sx*(a-cx)-s*sy*(b-cy), cy+y+s*sx*(a-cx)+c*sy*(b-cy)];
  const unmove = (a,b) => {
    a -= cx+x;
    b -= cy+y;
    return [cx+(c*a+s*b)/sx, cy+(-s*a+c*b)/sy];
  };
  if (!Array.isArray(fit.pins) || fit.pins.length > 32) throw Error('Use at most 32 local controls.');
  const pins = fit.pins.map(({source,target,radius}) => {
    if (!point(source) || !point(target) || !Number.isFinite(radius) || radius < 24 || radius > 480) throw Error('Invalid local control.');
    const [px,py] = move(source);
    return {px,py,dx:target[0]-px,dy:target[1]-py,radius};
  });

  const basis = r => r>=1 ? 0 : (1-r)**4*(4*r+1);
  // Solve the interpolation system so changing one pin keeps every other
  // landmark on its own target, even where two ears' supports overlap.
  const n=pins.length;
  const matrix=pins.map(p=>[...pins.map(q=>basis(Math.hypot(p.px-q.px,p.py-q.py)/q.radius)),p.dx,p.dy]);
  for(let col=0;col<n;col++){
    let pivot=col;
    for(let row=col+1;row<n;row++) if(Math.abs(matrix[row][col])>Math.abs(matrix[pivot][col])) pivot=row;
    if(Math.abs(matrix[pivot][col])<1e-5) throw Error('Local controls are too close together. Reposition a source point.');
    [matrix[col],matrix[pivot]]=[matrix[pivot],matrix[col]];
    const scale=matrix[col][col];
    for(let j=col;j<n+2;j++) matrix[col][j]/=scale;
    for(let row=0;row<n;row++){
      if(row===col)continue;
      const factor=matrix[row][col];
      for(let j=col;j<n+2;j++) matrix[row][j]-=factor*matrix[col][j];
    }
  }
  pins.forEach((p,i)=>{p.dx=matrix[i][n];p.dy=matrix[i][n+1];});
  // Wendland C2: max |d((1-r)^4(4r+1))/dr| = 135/64.
  // Sum of derivative bounds < 1 gives global injectivity and convergent inverse iteration.
  // Group disjoint supports into connected components to avoid charging one ear for the other.
  const visited = new Set();
  let gradient = 0;
  for (const start of pins) {
    if (visited.has(start)) continue;
    const queue = [start];
    visited.add(start);
    let bound = 0;
    while (queue.length) {
      const p = queue.pop();
      bound += (135/64) * Math.hypot(p.dx,p.dy) / p.radius;
      for (const q of pins) {
        if (!visited.has(q) && Math.hypot(p.px-q.px,p.py-q.py) < p.radius+q.radius) {
          visited.add(q);
          queue.push(q);
        }
      }
    }
    gradient = Math.max(gradient,bound);
  }
  if (gradient > .55) throw Error('Local distortion limit exceeded. Reduce displacement or reposition the global fit.');
  const extent = pins.reduce((sum,p) => sum+Math.hypot(p.dx,p.dy),0);
  function displacement(a,b) {
    let dx = 0, dy = 0;
    for (const p of pins) {
      const r = Math.hypot(a-p.px,b-p.py)/p.radius;
      if (r >= 1) continue;
      const w = basis(r);
      dx += w*p.dx;
      dy += w*p.dy;
    }
    return [dx,dy];
  }
  function forward(source) {
    const [a,b] = move(source);
    const [dx,dy] = displacement(a,b);
    return [a+dx,b+dy];
  }
  function inverse(x,y) {
    let a=x, b=y;
    for (let i=0; i<32 && pins.length; i++) {
      const [dx,dy] = displacement(a,b);
      const na=x-dx, nb=y-dy;
      if (Math.abs(a-na)+Math.abs(b-nb)<.0001) return unmove(na,nb);
      a=na; b=nb;
    }
    return unmove(a,b);
  }
  return {move,forward,inverse,gradient,extent};
}

export function bounds(data, size=SIZE) {
  let x0=size, y0=size, x1=-1, y1=-1;
  for (let y=0; y<size; y++) for (let x=0; x<size; x++) if (data[(y*size+x)*4+3]) {
    x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y);
  }
  return x1<0 ? null : [x0,y0,x1,y1];
}

// Path nodes are [x, y]. The midpoint quadratic spline closes tangentially.
export function traceMask(ctx, nodes) {
  if (!Array.isArray(nodes) || nodes.length>128 || !nodes.every(point)) throw Error('Invalid separation path.');
  if (nodes.length<3) return false;
  const mid = (a,b) => [(a[0]+b[0])/2,(a[1]+b[1])/2];
  ctx.beginPath();
  ctx.moveTo(...mid(nodes.at(-1),nodes[0]));
  nodes.forEach((p,i) => ctx.quadraticCurveTo(...p,...mid(p,nodes[(i+1)%nodes.length])));
  ctx.closePath();
  return true;
}

function sample(src,size,x,y,result) {
  const x0=Math.floor(x), y0=Math.floor(y), tx=x-x0, ty=y-y0;
  let a=0, r=0, g=0, b=0;
  for (let j=0;j<2;j++) for (let i=0;i<2;i++) {
    const px=x0+i, py=y0+j;
    if (px<0 || py<0 || px>=size || py>=size) continue;
    const k=(py*size+px)*4;
    const w=(i?tx:1-tx)*(j?ty:1-ty)*src[k+3];
    a+=w; r+=w*src[k]; g+=w*src[k+1]; b+=w*src[k+2];
  }
  result[0]=a?r/a:0; result[1]=a?g/a:0; result[2]=a?b/a:0; result[3]=a;
}

// Back mask is authored in source space. For a partially covered pixel, divide
// opacity between the planes so source-over recombines to the original opacity.
export function raster({front,back,box,mask}, warp, size=SIZE) {
  const outF=new Uint8ClampedArray(size*size*4), outB=new Uint8ClampedArray(outF.length);
  if (!box) return {front:outF,back:outB};
  const [x0,y0,x1,y1]=box;
  const corners=[[x0-1,y0-1],[x1+1,y0-1],[x0-1,y1+1],[x1+1,y1+1]].map(warp.move);
  const low=i=>Math.max(0,Math.floor(Math.min(...corners.map(p=>p[i]))-warp.extent-1));
  const high=i=>Math.min(size-1,Math.ceil(Math.max(...corners.map(p=>p[i]))+warp.extent+1));
  const xl=low(0), xr=high(0), yt=low(1), yb=high(1);
  const f=[0,0,0,0], b=[0,0,0,0], m=[0,0,0,0];
  for (let y=yt;y<=yb;y++) for (let x=xl;x<=xr;x++) {
    const [u,v]=warp.inverse(x+.5,y+.5);
    const k=(y*size+x)*4;
    sample(front,size,u-.5,v-.5,f);
    if (back) sample(back,size,u-.5,v-.5,b);
    else b.fill(0);
    const total=f[3]+b[3]*(1-f[3]/255);
    if (mask && f[3]) {
      sample(mask,size,u-.5,v-.5,m);
      const retain=f[3]*(1-m[3]/255);
      const rear=retain===255 ? b[3] : (total-retain)/(1-retain/255);
      const moved=rear-b[3]*(1-(retain===255?0:Math.max(0,(f[3]-retain)/(1-retain/255)))/255);
      if (rear>0 && m[3]>0) {
        for (let c=0;c<3;c++) b[c]=(f[c]*moved+b[c]*(rear-moved))/rear;
        b[3]=rear;
      }
      f[3]=retain;
    }
    if (Math.round(f[3])) outF.set(f,k);
    if (Math.round(b[3])) outB.set(b,k);
  }
  return {front:outF,back:outB};
}

export function nextEntry(approvals) {
  return ORDER.find(entry => !Object.hasOwn(approvals,keyOf(entry))) ?? null;
}


const crcTable = Uint32Array.from({length:256}, (_, n) => {
  for (let bit=0; bit<8; bit++) n=(n>>>1)^((n&1)?0xedb88320:0);
  return n;
});

function pngChunk(name, data) {
  const bytes=new Uint8Array(data.length+12);
  const view=new DataView(bytes.buffer);
  view.setUint32(0,data.length);
  for(let i=0;i<4;i++) bytes[4+i]=name.charCodeAt(i);
  bytes.set(data,8);
  let crc=0xffffffff;
  for(let i=4;i<bytes.length-4;i++) crc=(crc>>>8)^crcTable[(crc^bytes[i])&255];
  view.setUint32(bytes.length-4,crc^0xffffffff);
  return bytes;
}

// PNG RGBA8 with filter 0 and stored DEFLATE blocks. The ZIP compresses
// these bytes for delivery. Fixed encoding keeps PNG hashes reproducible.
export function rgbaPng(data,size=SIZE) {
  const stride=size*4;
  if(data.length!==size*stride) throw Error('Invalid RGBA raster.');
  const raw=new Uint8Array((stride+1)*size);
  for(let y=0;y<size;y++)raw.set(data.subarray(y*stride,(y+1)*stride),y*(stride+1)+1);
  const blocks=Math.ceil(raw.length/65535);
  const z=new Uint8Array(raw.length+5*blocks+6);
  z.set([0x78,0x01]);
  let a=1,b=0,o=2;
  for(let i=0;i<raw.length;){
    const n=Math.min(65535,raw.length-i);
    z.set([i+n===raw.length?1:0,n&255,n>>>8,(~n)&255,((~n)>>>8)&255],o);
    z.set(raw.subarray(i,i+n),o+5);
    for(let j=i;j<i+n;j++){a=(a+raw[j])%65521;b=(b+a)%65521;}
    i+=n;o+=n+5;
  }
  new DataView(z.buffer).setUint32(o,(b<<16)|a);
  const header=new Uint8Array(13),meta=new DataView(header.buffer);
  meta.setUint32(0,size);meta.setUint32(4,size);header.set([8,6],8);
  const parts=[Uint8Array.of(137,80,78,71,13,10,26,10),pngChunk('IHDR',header),pngChunk('IDAT',z),pngChunk('IEND',new Uint8Array())];
  const out=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0));
  let offset=0;
  for(const p of parts){out.set(p,offset);offset+=p.length;}
  return out;
}
