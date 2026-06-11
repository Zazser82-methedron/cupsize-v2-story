// ════════════════════════════════════════════════════════════════════════════
// story-anim.js v3 — кинематографичные сюжетные анимации, 60fps, аудио-реактив
// Ядро: тайминг, аудио-анализ, скетч-примитивы, персонажи, частицы, реквизит
// ════════════════════════════════════════════════════════════════════════════

// ─── Тайминг / прогресс ───────────────────────────────────────────────────────
let _frame = 0, _sk = 0, _pg = -1;
// пер-сценовые пулы частиц (привязка к активной сцене → нет переноса деталей между кадрами)
let _scenePools = {}, _sceneCur = null, _trackN = -2;
function boil(){ return Math.floor(_frame/5); }
// стабильный «карандашный» дребезг: одинаков внутри кадра, меняется раз в ~5 кадров
function ww(amp){ const s=Math.sin((_sk++ + boil()*53.7)*12.9898)*43758.5453; return ((s-Math.floor(s))-0.5)*amp; }
function lPidx(){ return kPrevIdx<0?0:kPrevIdx/Math.max(1,karaokeLines.length-1); }
function prog(){
  let target=null;
  try{ if(typeof howl!=='undefined'&&howl){ const s=howl.seek(),d=howl.duration(); if(typeof s==='number'&&d>0) target=Math.min(1,Math.max(0,s/d)); } }catch(e){}
  if(target===null) target=lPidx();
  if(_pg<0) _pg=target; else { _pg+=(target-_pg)*0.1; if(Math.abs(target-_pg)<0.0004)_pg=target; }
  return Math.max(0,Math.min(1,_pg));
}
const EZ={ io:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, out:t=>1-Math.pow(1-t,3), in:t=>t*t*t,
  bounce:t=>Math.abs(Math.sin(t*Math.PI)), pulse:t=>0.5-0.5*Math.cos(t*Math.PI*2),
  back:t=>1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2),                                   // доводка с замахом
  elastic:t=>t<=0?0:t>=1?1:Math.pow(2,-10*t)*Math.sin((t*10-0.75)*2.0943951)+1 };               // упругий приход
// органика для «живости» — вместо чистого синуса
function _h1(i){ const s=Math.sin(i*127.1)*43758.5453; return s-Math.floor(s); }
function nz(x){ const i=Math.floor(x),f=x-i,u=f*f*(3-2*f); return _h1(i)+(_h1(i+1)-_h1(i))*u; }  // плавный value-noise [0..1]
function breathe(seed){ return Math.sin(_frame*0.045+seed)*0.6+Math.sin(_frame*0.017+seed*1.7)*0.4; } // [-1..1] орг.дыхание
function blinkAt(seed){ const per=150+Math.floor((seed%1+1)*40); return ((_frame+Math.floor(seed*53))%per)<6; }
function T(){ return _frame; }

// ─── Аудио-анализ (Web Audio поверх Howler) ──────────────────────────────────
const AUD={level:0,bass:0,mid:0,high:0,beat:0,_an:null,_ctx:null,_data:null,_connected:null,_avg:0.001,_t:0};
function audHook(){
  try{
    if(typeof howl==='undefined'||!howl||!howl._sounds||!howl._sounds[0])return;
    const node=howl._sounds[0]._node; if(!node)return;
    if(!AUD._connected) AUD._connected=new WeakSet();
    if(AUD._connected.has(node))return;
    if(!AUD._ctx) AUD._ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(AUD._ctx.state==='suspended') AUD._ctx.resume();
    const src=AUD._ctx.createMediaElementSource(node);
    if(!AUD._an){ AUD._an=AUD._ctx.createAnalyser(); AUD._an.fftSize=256; AUD._an.smoothingTimeConstant=0.5; AUD._data=new Uint8Array(AUD._an.frequencyBinCount); }
    src.connect(AUD._an); AUD._an.connect(AUD._ctx.destination);
    AUD._connected.add(node);
  }catch(e){}
}
function audTick(){
  const now=(typeof performance!=='undefined')?performance.now():_frame*16;
  if(now-AUD._t<8)return; AUD._t=now;
  audHook();
  let synth=true;
  if(AUD._an&&AUD._data){
    AUD._an.getByteFrequencyData(AUD._data);
    const d=AUD._data,n=d.length;
    const bN=Math.max(1,Math.floor(n*0.08)), mN=Math.floor(n*0.4);
    let b=0,m=0,h=0;
    for(let i=0;i<bN;i++)b+=d[i]; b/=bN*255;
    for(let i=bN;i<mN;i++)m+=d[i]; m/=Math.max(1,mN-bN)*255;
    for(let i=mN;i<n;i++)h+=d[i]; h/=Math.max(1,n-mN)*255;
    if(b+m+h>0.012){
      synth=false;
      AUD.bass+=(b-AUD.bass)*0.35; AUD.mid+=(m-AUD.mid)*0.3; AUD.high+=(h-AUD.high)*0.3;
      AUD.level+=((b*0.5+m*0.35+h*0.15)-AUD.level)*0.3;
      AUD._avg=AUD._avg*0.97+b*0.03;
      const on=b>AUD._avg*1.32&&b>0.16;
      AUD.beat=Math.max(AUD.beat*0.88,on?1:0);
    }
  }
  if(synth){
    const tt=_frame*0.05;
    const v=0.25+0.18*Math.sin(tt*2.1)+0.1*Math.sin(tt*3.7);
    AUD.level+=(v-AUD.level)*0.2; AUD.bass=AUD.level; AUD.mid=AUD.level*0.8; AUD.high=AUD.level*0.6;
    AUD.beat=Math.max(AUD.beat*0.9,(Math.sin(tt*2.4)>0.93)?0.8:0);
  }
}
function kick(n){ return 1+AUD.beat*(n==null?0.06:n); }

// ─── Цвет / перо ──────────────────────────────────────────────────────────────
const ACCENT={1:[200,40,26],2:[90,106,138],3:[122,96,32],4:[122,74,42],5:[214,110,150],
  6:[74,106,122],7:[176,60,40],8:[150,52,52],9:[150,90,170],10:[130,42,90],
  11:[200,74,106],12:[80,100,70],13:[200,40,80],14:[70,90,140],15:[160,120,60],
  16:[100,100,110],17:[210,90,40],18:[60,140,90],19:[180,80,140],20:[110,80,140],
  21:[170,110,60],22:[190,120,130],23:[60,80,140],24:[190,50,60],25:[140,30,30],26:[230,120,40]};
function accRGB(){ const n=(typeof currentTrack!=='undefined'&&currentTrack)?currentTrack.n:1; return ACCENT[n]||[200,40,26]; }
function ink(a,wd){ ctx.strokeStyle=`rgba(26,22,18,${a})`; if(wd!=null)ctx.lineWidth=wd; }
function red(a,wd){ ctx.strokeStyle=`rgba(200,40,26,${a})`; if(wd!=null)ctx.lineWidth=wd; }
function acc(a,wd){ const c=accRGB(); ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`; if(wd!=null)ctx.lineWidth=wd; }
function fink(a){ ctx.fillStyle=`rgba(26,22,18,${a})`; }
function fred(a){ ctx.fillStyle=`rgba(200,40,26,${a})`; }
function facc(a){ const c=accRGB(); ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function txt(s,x,y,size,a,col){ ctx.font=`${size}px Caveat`; ctx.fillStyle=col||`rgba(26,22,18,${a})`; ctx.textAlign='center'; ctx.fillText(s,x,y); }
function caption(s,W,H,a){ txt(s,W*0.5,H*0.93,Math.max(14,Math.min(20,W*0.034)),a==null?0.45:a); }
function writeOn(s,x,y,size,lp,a,col){
  const n=Math.floor(s.length*Math.max(0,Math.min(1,lp)));
  ctx.font=`${size}px Caveat`; ctx.fillStyle=col||`rgba(26,22,18,${a})`; ctx.textAlign='center';
  ctx.fillText(s.slice(0,n)+(n<s.length&&n>0?'|':''),x,y);
}
function flash(a,col){ ctx.fillStyle=col||`rgba(200,40,26,${a})`; ctx.fillRect(0,0,cW(),cH()); }

// ─── Фон кадра ────────────────────────────────────────────────────────────────
function bg(W,H){
  ctx.clearRect(0,0,W,H); ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  const c=accRGB();
  ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.035)`; ctx.fillRect(0,0,W,H);
  const tn=(typeof currentTrack!=='undefined'&&currentTrack)?currentTrack.n:-1;
  if(tn!==_trackN){ _trackN=tn; _scenePools={}; _sceneCur=null; }   // новый трек → чистим пулы
  _sk=0; _frame++; audTick();
}

// ─── Скетч-примитивы (стабильный boil-дребезг) ────────────────────────────────
function sl(x1,y1,x2,y2,w){ w=w==null?1.4:w; const dx=x2-x1,dy=y2-y1,steps=Math.max(2,Math.floor(Math.hypot(dx,dy)/9)); ctx.beginPath(); ctx.moveTo(x1+ww(w),y1+ww(w)); for(let i=1;i<=steps;i++){const t=i/steps; ctx.lineTo(x1+dx*t+ww(w),y1+dy*t+ww(w));} ctx.stroke(); }
function scir(cx,cy,r,w){ w=w==null?1.6:w; const steps=Math.max(14,Math.floor(r*0.7)); ctx.beginPath(); for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2; const rr=r+ww(w); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.stroke(); }
function sarc(cx,cy,r,a0,a1,w){ w=w==null?1.4:w; const steps=Math.max(6,Math.floor(Math.abs(a1-a0)*r*0.2)); ctx.beginPath(); for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps; const rr=r+ww(w); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); }
function sellipse(cx,cy,rx,ry,w){ w=w==null?1.4:w; const steps=Math.max(16,Math.floor((rx+ry)*0.4)); ctx.beginPath(); for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2; const x=cx+Math.cos(a)*(rx+ww(w)),y=cy+Math.sin(a)*(ry+ww(w)); i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.stroke(); }
function spath(pts,close,w){ w=w==null?1.2:w; ctx.beginPath(); for(let i=0;i<pts.length;i++){ const x=pts[i][0]+ww(w),y=pts[i][1]+ww(w); i?ctx.lineTo(x,y):ctx.moveTo(x,y);} if(close)ctx.closePath(); ctx.stroke(); }
function srect(x,y,w2,h2,w){ spath([[x,y],[x+w2,y],[x+w2,y+h2],[x,y+h2]],true,w); }

// ─── Сцены ────────────────────────────────────────────────────────────────────
// scenes(p, [fn,fn,...]) — равные доли с кроссфейдом (как v2)
// пер-сценовый пул частиц (живёт и гаснет ВНУТРИ своей сцены → нет переноса между кадрами)
function _scenePool(key){ let pl=_scenePools[key]; if(!pl){ pl=mkParts(420); _scenePools[key]=pl; } return pl; }
function emit(o){ _scenePool(_sceneCur||'__def').spawn(o); }
function flushParts(){ const d=_scenePools['__def']; if(d){ d.step(); d.draw(); } }   // для частиц вне сцен (в конце кадра трека)
// рендер одной сцены с её пулом частиц под её alpha
function _renderScene(key,a,lp,fn){
  const prev=_sceneCur; _sceneCur=key; const pool=_scenePool(key);
  ctx.save(); ctx.globalAlpha*=a; fn(lp,a); pool.step(); pool.draw(); ctx.restore();
  _sceneCur=prev;
}
// scenes(p,[fn,...]) — равные доли, переход «дип в бумагу» (две сцены НИКОГДА не накладываются)
function scenes(p,arr){
  const n=arr.length, seg=1/n, fade=Math.min(0.05,seg*0.45);
  for(let i=0;i<n;i++){
    const start=i*seg, end=start+seg;
    if(p<start||p>end) continue;                    // каждая сцена владеет своим сегментом эксклюзивно
    let a=1;
    if(i>0 && p<start+fade) a=(p-start)/fade;        // проявление из бумаги
    if(i<n-1 && p>end-fade) a=Math.min(a,(end-p)/fade); // уход в бумагу
    a=Math.max(0,Math.min(1,a)); if(a<=0.002) continue;
    const lp=Math.max(0,Math.min(1,(p-start)/seg));
    _renderScene('S'+i,a,lp,arr[i]);
  }
}
function lastP(p,fromN){ return Math.max(0,Math.min(1,(p-(fromN-1)/fromN)*fromN)); }
// span/act — произвольные интервалы [from..to] из раскадровки, с кроссфейдом
function span(p,from,to,fade){
  fade=fade==null?0.02:fade;
  if(p<from||p>to)return null;                        // акт строго в своих границах (нет наезда на соседа)
  let a=1;
  if(from>0.001&&p<from+fade)a=Math.min(a,(p-from)/fade);   // проявление из бумаги
  if(to<0.999&&p>to-fade)    a=Math.min(a,(to-p)/fade);     // уход в бумагу
  const lp=Math.max(0,Math.min(1,(p-from)/Math.max(0.0001,to-from)));
  return {a:Math.max(0,Math.min(1,a)),lp};
}
function act(p,from,to,fn,fade){
  const s=span(p,from,to,fade); if(!s||s.a<=0.003)return;
  _renderScene('A'+from+'_'+to,s.a,s.lp,fn);
}
function camShake(amp){ ctx.translate(ww(amp),ww(amp)); }

// ─── Персонаж ─────────────────────────────────────────────────────────────────
// figure(x,y,{s,a,lean,flip,ph,step,swing,raise,raiseL,raiseR,sit,fem,hairFlow,hairLong,hair,face,headTilt})
function figure(x,y,o){
  o=o||{};
  const s=o.s||1, a=o.a==null?0.82:o.a, ph=o.ph||0, lean=o.lean||0, fem=o.fem;
  const raise=o.raise||0, rl=o.raiseL!=null?o.raiseL:raise, rr=o.raiseR!=null?o.raiseR:raise;
  const seed=o.seed!=null?o.seed:(x*0.017+y*0.0031);
  const br=(o.breath===false)?0:breathe(seed);                 // лёгкое дыхание (idle-жизнь)
  const blink=(o.blink===false)?false:blinkAt(seed);
  ctx.save(); ctx.translate(x,y+br*0.6); if(o.flip)ctx.scale(-1,1); ctx.rotate(lean+(o.breath===false?0:br*0.004)); ctx.scale(s,s);
  o._blink=blink;
  function armPair(){
    const aw=Math.sin(ph)*(o.swing||0);
    sl(0,-12,-10,-2+rl*-7,1.3/s); sl(-10,-2+rl*-7,-16+aw,(rl>0.3?-12-rl*8:9),1.2/s);
    sl(0,-12,10,-2-rr*7,1.3/s); sl(10,-2-rr*7,16-aw,(rr>0.3?-12-rr*8:9),1.2/s);
  }
  ink(a,1.5/s);
  ctx.save(); ctx.rotate(o.headTilt||0);
  scir(0,-30,9,1.1);
  if(o.hair!=='none'){ ink(a*0.75,1/s);
    if(fem){ const fl=o.hairFlow||0, hl=o.hairLong==null?-6:o.hairLong;
      for(let i=-4;i<=4;i++) sl(i*2.1,-37,i*3+fl,hl,0.9); }
    else { for(let i=-3;i<=3;i++) sl(i*2.4,-38,i*2.6,-33,0.7); } }
  if(o.face) drawFace(0,-30,o.face,a,o._blink);
  ctx.restore();
  ink(a,1.4/s);
  const tx=Math.sin(ph)*1.4;
  if(o.sit){
    sl(0,-21,0,12,1.4);
    armPair();
    sl(0,12,14,14,1.3); sl(14,14,14,32,1.2);
    sl(0,12,10,16,1.3); sl(10,16,10,32,1.2);
    if(fem){ ink(a,1.2/s); ctx.beginPath(); ctx.moveTo(-8,-2); ctx.lineTo(-9,14); ctx.lineTo(15,16); ctx.lineTo(8,-2); ctx.stroke(); }
  } else {
    sl(0,-21,tx,16,1.4);
    armPair();
    const lw=Math.sin(ph)*(o.step||0);
    sl(tx,16,-7,32,1.3); sl(-7,32,-9-lw,50,1.2);
    sl(tx,16,7,32,1.3); sl(7,32,9+lw,50,1.2);
    if(fem){ ink(a,1.2/s); ctx.beginPath(); ctx.moveTo(-9,18); ctx.lineTo(-15,42); ctx.lineTo(15,42); ctx.lineTo(9,18); ctx.stroke(); }
  }
  ctx.restore();
}
// drawFace(x,y,type,a): 'happy','sad','angry','cry','flat','x','shock','love','calm'
function drawFace(x,y,type,a,blink){
  if(type==='x'){ red(a,1); sl(x-6,y-4,x-2,y,0.5); sl(x-2,y-4,x-6,y,0.5); sl(x+2,y-4,x+6,y,0.5); sl(x+6,y-4,x+2,y,0.5); return; }
  if(type==='love'){ drawHeart(x-3.5,y-2,3,a); drawHeart(x+3.5,y-2,3,a); ink(a,0.9); sarc(x,y+2,4,0.25,Math.PI-0.25,0.5); return; }
  if(type==='calm'){ ink(a,0.8); sarc(x-3.5,y-2,2,0.2,Math.PI-0.2,0.5); sarc(x+3.5,y-2,2,0.2,Math.PI-0.2,0.5); sl(x-2,y+5,x+2,y+5,0.5); return; }
  if(blink){ ink(a,0.9); sl(x-5,y-2,x-2,y-2,0.6); sl(x+2,y-2,x+5,y-2,0.6); }
  else { fink(a); ctx.beginPath(); ctx.arc(x-3.5,y-2,1.3,0,7); ctx.arc(x+3.5,y-2,1.3,0,7); ctx.fill(); }
  ink(a,0.9);
  if(type==='sad') sarc(x,y+7,4,Math.PI*1.15,Math.PI*1.85,0.5);
  else if(type==='happy') sarc(x,y+2,4,0.25,Math.PI-0.25,0.5);
  else if(type==='angry'){ sl(x-5,y-5,x-1,y-3,0.4); sl(x+1,y-3,x+5,y-5,0.4); sl(x-3,y+5,x+3,y+5,0.5); }
  else if(type==='cry'){ sarc(x,y+7,4,Math.PI*1.2,Math.PI*1.8,0.5); ctx.fillStyle=`rgba(60,90,170,${a*0.7})`; ctx.beginPath(); ctx.arc(x-3.5,y+3+((_frame*0.8)%14),1.2,0,7); ctx.arc(x+3.5,y+5+((_frame*0.8+7)%14),1.2,0,7); ctx.fill(); }
  else if(type==='shock'){ scir(x,y+5,2.2,0.5); }
  else if(type==='flat') sl(x-3,y+5,x+3,y+5,0.5);
  else sl(x-3,y+4,x+3,y+5,0.5);
}

// ─── Частицы ──────────────────────────────────────────────────────────────────
// p=mkParts(); p.spawn({x,y,vx,vy,g,life,r,col:[r,g,b],type,rot,vr,drag,txt})
// types: dot|line|star|heart|note|smoke|shard|petal|drop
function mkParts(max){
  max=max||300;
  return {
    list:[],
    spawn(o){ if(this.list.length>=max)this.list.shift();
      this.list.push({x:o.x,y:o.y,vx:o.vx||0,vy:o.vy||0,g:o.g==null?0:o.g,life:o.life||60,age:0,r:o.r||2,
        col:o.col||null,type:o.type||'dot',rot:o.rot||0,vr:o.vr||0,drag:o.drag==null?1:o.drag,txt:o.txt}); },
    step(){ this.list=this.list.filter(p=>{ p.age++; p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.vx*=p.drag; p.vy*=p.drag; p.rot+=p.vr; return p.age<p.life; }); },
    draw(){ this.list.forEach(p=>{ const k=1-p.age/p.life, c=p.col||[26,22,18];
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      if(p.type==='dot'){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.8*k})`; ctx.beginPath(); ctx.arc(0,0,p.r,0,7); ctx.fill(); }
      else if(p.type==='line'){ ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.8*k})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-p.vx*3,-p.vy*3); ctx.stroke(); }
      else if(p.type==='star'){ star5(0,0,p.r,0.8*k,`rgba(${c[0]},${c[1]},${c[2]},${0.7*k})`); }
      else if(p.type==='heart'){ drawHeart(0,0,p.r,0.85*k,c); }
      else if(p.type==='note'){ ctx.font=(p.r*5)+'px Caveat'; ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.85*k})`; ctx.textAlign='center'; ctx.fillText(p.txt||'♪',0,0); }
      else if(p.type==='smoke'){ ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.3*k})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,p.r*(1+p.age*0.02),0,7); ctx.stroke(); }
      else if(p.type==='shard'){ ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.8*k})`; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-p.r,0); ctx.lineTo(0,-p.r*0.6); ctx.lineTo(p.r,0); ctx.closePath(); ctx.stroke(); }
      else if(p.type==='petal'){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.6*k})`; ctx.beginPath(); ctx.ellipse(0,0,p.r,p.r*0.45,0,0,7); ctx.fill(); }
      else if(p.type==='drop'){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.7*k})`; ctx.beginPath(); ctx.arc(0,0,p.r,0,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-p.r*0.6,0); ctx.lineTo(0,-p.r*1.8); ctx.lineTo(p.r*0.6,0); ctx.fill(); }
      ctx.restore(); }); }
  };
}
// погода-фабрики: const rain=mkRain(40); в кадре: rain(W,H,0.2,wind)
function mkRain(n){ const d=Array.from({length:n||40},()=>({x:rnd(0,1),y:rnd(0,1),v:rnd(0.006,0.014),l:rnd(8,16)}));
  return function(W,H,a,wind){ wind=wind||0; ink(a==null?0.2:a,0.8); d.forEach(r=>{ r.y+=r.v; r.x+=wind*0.001; if(r.y>1){r.y=-0.05;r.x=rnd(0,1);} if(r.x>1)r.x-=1; const x=r.x*W,y=r.y*H; sl(x,y,x-wind-1.5,y+r.l,0.5); }); }; }
function mkSnow(n){ const d=Array.from({length:n||60},()=>({x:rnd(0,1),y:rnd(0,1),r:rnd(1.2,3),v:rnd(0.0008,0.003),ph:rnd(0,6.28)}));
  return function(W,H,a){ d.forEach(s=>{ s.y+=s.v; if(s.y>1){s.y=-0.02;s.x=rnd(0,1);} const x=s.x*W+Math.sin(_frame*0.02+s.ph)*14, y=s.y*H; fink(a==null?0.25:a); ctx.beginPath(); ctx.arc(x,y,s.r,0,7); ctx.fill(); }); }; }

// ─── Реквизит ─────────────────────────────────────────────────────────────────
function cloud(cx,cy,r,a){ ink(a,1); scir(cx,cy,r,2); scir(cx-r*0.72,cy+r*0.28,r*0.6,1.8); scir(cx+r*0.72,cy+r*0.28,r*0.6,1.8); }
function bldg(x,yTop,w,base,a,rows){ ink(a,1.1); sl(x,base,x,yTop,1); sl(x+w,base,x+w,yTop,1); sl(x,yTop,x+w,yTop,1); if(rows){ for(let r=0;r<rows;r++)for(let c=0;c<3;c++){ const wx=x+(c+0.5)*w/3, wy=yTop+(r+0.7)*(base-yTop)/(rows+0.5); const lit=Math.sin(wx*9.13+wy*5.7+Math.floor(_frame/40))*0.5+0.5; ctx.fillStyle=`rgba(220,190,120,${a*0.45*(0.2+0.8*lit)})`; ctx.fillRect(wx-3,wy-5,6,9); ink(a*0.5,0.6); ctx.strokeRect(wx-3,wy-5,6,9);} } }
function windowFrame(x,y,w,h,a){ ink(a,1.5); sl(x,y,x+w,y,1.4); sl(x,y,x,y+h,1.4); sl(x+w,y,x+w,y+h,1.4); sl(x,y+h,x+w,y+h,1.4); sl(x+w/2,y,x+w/2,y+h,0.9); sl(x,y+h/2,x+w,y+h/2,0.9); }
function balloon(x,y,r,anchorX,anchorY,a){ red(a,1.4); scir(x,y,r,1.6); ctx.fillStyle=`rgba(200,40,26,${a*0.35})`; ctx.beginPath(); ctx.arc(x,y,r-1,0,7); ctx.fill(); ink(a*0.7,1); sl(x,y+r,(x+anchorX)/2+ww(3),(y+anchorY)/2,1); sl((x+anchorX)/2,(y+anchorY)/2,anchorX,anchorY,1); }
function star5(x,y,r,a,fill){ ctx.beginPath(); for(let i=0;i<10;i++){const ang=i/5*Math.PI-Math.PI/2,rr=i%2?r*0.4:r; const px=x+Math.cos(ang)*rr,py=y+Math.sin(ang)*rr; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.closePath(); if(fill){ctx.fillStyle=fill;ctx.fill();} else {red(a,1.2);ctx.stroke();} }
function drawHeart(x,y,r,a,c){ c=c||[200,40,26]; ctx.save(); ctx.translate(x,y); ctx.scale(r/10,r/10);
  ctx.beginPath(); ctx.moveTo(0,3); ctx.bezierCurveTo(-7,-4,-3,-10,0,-5); ctx.bezierCurveTo(3,-10,7,-4,0,3); ctx.closePath();
  ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`; ctx.fill(); ctx.restore(); }
function drawBike(x,y,s,a,rot){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ink(a,1.6);
  scir(-22,0,13,1.4); scir(22,0,13,1.4);
  ink(a*0.6,0.8); for(let i=0;i<3;i++){const an=(rot||0)+i*Math.PI/3; sl(-22-Math.cos(an)*11,-Math.sin(an)*11,-22+Math.cos(an)*11,Math.sin(an)*11,0.6); sl(22-Math.cos(an)*11,-Math.sin(an)*11,22+Math.cos(an)*11,Math.sin(an)*11,0.6);}
  ink(a,1.5); sl(-22,0,-4,-16,1.3); sl(-4,-16,12,-16,1.3); sl(12,-16,22,0,1.3); sl(-4,-16,2,0,1.2); sl(2,0,-22,0,1.2);
  sl(12,-16,15,-24,1.2); sl(11,-24,19,-24,1.2);
  sl(-4,-16,-7,-23,1.2); sl(-11,-23,-3,-23,1.2);
  ctx.restore(); }
function drawSwing(x,y,h,ang,a){
  ink(a,1.4); sl(x-26,y,x-14,y+h,1.2); sl(x+26,y,x+14,y+h,1.2); sl(x-30,y,x+30,y,1.4);
  ctx.save(); ctx.translate(x,y); ctx.rotate(ang||0); sl(-9,0,-9,h*0.78,1); sl(9,0,9,h*0.78,1); sl(-11,h*0.78,11,h*0.78,1.3); ctx.restore(); }
function drawTree(x,gy,s,a,wind){ ctx.save(); ctx.translate(x,gy); ctx.scale(s,s); ink(a,1.5);
  sl(0,0,0,-46,1.8); const w=wind||0;
  sl(0,-18,-16+w,-34,1.1); sl(0,-26,14+w,-44,1.1); sl(0,-34,-10+w,-52,1);
  ink(a*0.8,1.1); scir(-16+w,-40,11,2); scir(14+w,-50,12,2); scir(w,-56,13,2); ctx.restore(); }
function drawBottle(x,y,s,a,tilt){ ctx.save(); ctx.translate(x,y); ctx.rotate(tilt||0); ctx.scale(s,s); ink(a,1.2);
  sl(-5,0,-5,-14,1.1); sl(5,0,5,-14,1.1); sl(-5,-14,-2,-20,1); sl(5,-14,2,-20,1); sl(-2,-20,-2,-26,1); sl(2,-20,2,-26,1); sl(-2,-26,2,-26,1); sl(-5,0,5,0,1.2); ctx.restore(); }
function drawKnife(x,y,s,ang,a){ ctx.save(); ctx.translate(x,y); ctx.rotate(ang||0); ctx.scale(s,s); ink(a,1.3);
  ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(3,6); ctx.lineTo(-3,6); ctx.closePath(); ctx.stroke();
  ctx.fillStyle=`rgba(55,35,15,${a*0.7})`; ctx.fillRect(-3.5,6,7,10); ink(a*0.8,0.8); ctx.strokeRect(-3.5,6,7,10); ctx.restore(); }
function drawFlower(x,y,s,a,sway){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ink(a,1.1);
  sl(0,0,sway||0,-18,1); red(a*0.9,1.1); for(let i=0;i<5;i++){const an=i/5*6.28; scir((sway||0)+Math.cos(an)*4,-18+Math.sin(an)*4,3,1);} fred(a*0.5); ctx.beginPath(); ctx.arc(sway||0,-18,2.4,0,7); ctx.fill(); ctx.restore(); }
function drawCat(x,y,s,a,tail){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ink(a,1.2);
  scir(0,-6,7,1.2); sl(-5,-11,-8,-17,1); sl(-5,-11,-2,-16,1); sl(5,-11,8,-17,1); sl(5,-11,2,-16,1);
  ctx.beginPath(); ctx.ellipse(10,4,12,7,0,0,7); ctx.stroke();
  sarc(22,2,8,-1.2,0.6+(tail||0),1); fink(a); ctx.beginPath(); ctx.arc(-2.5,-7,0.8,0,7); ctx.arc(2.5,-7,0.8,0,7); ctx.fill(); ctx.restore(); }
function drawDog(x,y,s,a,bark){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ink(a,1.2);
  ctx.beginPath(); ctx.ellipse(8,0,13,8,0,0,7); ctx.stroke();
  scir(-8,-8,6,1.1); sl(-12,-13,-15,-18,1); sl(-4,-13,-2,-18,1);
  sl(2,6,2,14,1); sl(14,6,14,14,1); sarc(20,-2,6,-0.8,0.9,1);
  if(bark){ ink(a*0.7,0.8); sl(-16,-10,-22,-12,0.7); sl(-16,-7,-23,-7,0.7); }
  fink(a); ctx.beginPath(); ctx.arc(-10,-9,0.8,0,7); ctx.fill(); ctx.restore(); }
function drawCross(x,y,s,a){ ink(a,1.6); sl(x,y,x,y-30*s,1.5); sl(x-10*s,y-20*s,x+10*s,y-20*s,1.4); }
function drawCandle(x,y,s,a,fl){ ink(a,1.2); sl(x-4*s,y,x-4*s,y-14*s,1.1); sl(x+4*s,y,x+4*s,y-14*s,1.1); sl(x-4*s,y,x+4*s,y,1.1); sl(x,y-14*s,x,y-17*s,0.8);
  const f=1+(fl||0); ctx.fillStyle=`rgba(230,160,60,${a*0.8})`; ctx.beginPath(); ctx.ellipse(x+ww(1),y-20*s,2.4*s*f,4.5*s*f,0,0,7); ctx.fill(); }
function drawPhone(x,y,s,a,glow){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ink(a,1.3); srect(-7,-12,14,24,1);
  if(glow){ ctx.fillStyle=`rgba(225,210,160,${0.3*glow})`; ctx.fillRect(-6,-11,12,22); } ctx.restore(); }
function drawHouse(x,gy,s,a){ ctx.save(); ctx.translate(x,gy); ctx.scale(s,s); ink(a,1.3);
  sl(-24,0,-24,-26,1.2); sl(24,0,24,-26,1.2); sl(-24,0,24,0,1.2); sl(-28,-26,28,-26,1.2); sl(-28,-26,0,-44,1.3); sl(28,-26,0,-44,1.3);
  windowFrame(-14,-20,11,11,a*0.9); sl(6,0,6,-18,1.1); sl(16,0,16,-18,1.1); sl(6,-18,16,-18,1.1); ctx.restore(); }
function drawMoon(x,y,r,a){ ink(a,1.4); scir(x,y,r,1.8); ink(a*0.4,0.8); sarc(x-r*0.25,y+r*0.1,r*0.3,0.5,2.6,0.8); }
function drawSun(x,y,r,a){ red(a,1.6); scir(x,y,r,2.2); ink(a*0.75,1); for(let i=0;i<10;i++){const an=i/10*6.28+_frame*0.004; sl(x+Math.cos(an)*(r+4),y+Math.sin(an)*(r+4),x+Math.cos(an)*(r+11),y+Math.sin(an)*(r+11),0.8);} }

// ─── Атмосфера ────────────────────────────────────────────────────────────────
function dust(W,H,a){ for(let i=0;i<14;i++){ const x=(Math.sin(i*53.1)*0.5+0.5)*W + Math.sin(_frame*0.01+i)*14; const y=((Math.cos(i*17.7)*0.5+0.5)*H + _frame*0.25*(0.5+i%3)) % H; ctx.fillStyle=`rgba(26,22,18,${a})`; ctx.beginPath(); ctx.arc(x,y,1+(i%3)*0.5,0,7); ctx.fill(); } }
function vignettePulse(W,H,base){ const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.7); g.addColorStop(0,'rgba(4,2,0,0)'); g.addColorStop(1,`rgba(4,2,0,${base+0.04*EZ.pulse((_frame%180)/180)+0.05*AUD.beat})`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
function ground(W,H,gy,a){ ink(a,1.4); sl(0,gy,W,gy,2); }



// ══════════════════════════════════════════════════════════════════════════════
// T1 — Семнадцать ножевых (knives)
// тихая кухня → ссора, летит посуда → он защищается кастрюлей → «ты умрёшь» →
// 17 ударов (счёт, вспышки в бит) → лужа крови → душа уплывает в облака, она рыдает
// ══════════════════════════════════════════════════════════════════════════════
function knives(){
  let t=0; _pg=-1;
  const parts=mkParts(220);
  const plates=Array.from({length:7},(_,i)=>({d:rnd(0,1),h:rnd(0.2,0.45),spin:rnd(0.1,0.3),sz:rnd(6,11)}));
  const stabs=Array.from({length:17},(_,i)=>({dx:(i%2?1:-1)*(6+(i*7)%60),dy:(i%5-2)*9,ang:rnd(-0.25,0.25),len:rnd(30,46)}));
  let lastStab=-1, bled=0;
  function kitchen(W,H,a){
    ground(W,H,H*0.8,0.22*a);
    ink(0.35*a,1.2); sl(W*0.05,H*0.34,W*0.24,H*0.34,1.2); sl(W*0.05,H*0.34,W*0.05,H*0.5,1); sl(W*0.24,H*0.34,W*0.24,H*0.5,1); sl(W*0.05,H*0.5,W*0.24,H*0.5,1); // шкаф
    windowFrame(W*0.76,H*0.2,W*0.14,H*0.2,0.4*a);
    ink(0.4*a,1.4); sl(W*0.34,H*0.62,W*0.66,H*0.62,1.4); sl(W*0.38,H*0.62,W*0.38,H*0.8,1.2); sl(W*0.62,H*0.62,W*0.62,H*0.8,1.2); // стол
  }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    dust(W,H,0.05);

    // ── 1. тихая кухня: ужин, пар над кастрюлей, сердечко ── 0–0.06
    act(p,0.0,0.06,(lp)=>{
      kitchen(W,H,1);
      ink(0.4,1); scir(W*0.44,H*0.6,7,1); scir(W*0.56,H*0.6,7,1); // тарелки
      ink(0.45,1.2); sl(W*0.5,H*0.595,W*0.54,H*0.595,1.1); // нож мирно лежит
      // кастрюля на плите + пар
      ink(0.5,1.3); srect(W*0.12,H*0.74,W*0.07,H*0.05,1.1); sl(W*0.1,H*0.74,W*0.21,H*0.74,1.2);
      ink(0.25,0.9); for(let i=0;i<3;i++){ const sy=H*0.72-((t*0.6+i*22)%40); sarc(W*0.155+Math.sin(t*0.04+i)*4,sy,5,0.4,2.7,0.7); }
      const br=Math.sin(t*0.05)*0.04;
      figure(W*0.36,H*0.47,{s:1.05,face:'happy',ph:br*3,a:0.78});
      figure(W*0.64,H*0.47,{s:1.05,face:'happy',fem:true,flip:true,hairFlow:Math.sin(t*0.04)*3,ph:-br*3,a:0.78});
      if((t%90)<50) drawHeart(W*0.5,H*0.36+Math.sin(t*0.06)*4,7,0.45);
      caption('было тихо…',W,H);
    });

    // ── 2. ссора: крик, посуда летит, лица злеют ── 0.05–0.30
    act(p,0.05,0.30,(lp)=>{
      kitchen(W,H,0.8);
      ctx.save(); camShake(lp*3+AUD.beat*4);
      const rage=EZ.io(Math.min(1,lp*1.6));
      figure(W*(0.36-lp*0.04),H*0.47,{s:1.05,face:rage>0.4?'shock':'flat',a:0.8,lean:-0.06*rage,raiseL:rage*0.5});
      figure(W*(0.64+lp*0.03),H*0.47,{s:1.05,face:'angry',fem:true,flip:true,a:0.85,raise:rage*0.8,hairFlow:Math.sin(t*0.25)*7});
      // летящие тарелки (по дуге, крутятся)
      plates.forEach((pl,i)=>{
        const fp=(lp*1.4-pl.d); if(fp<0||fp>1)return;
        const px=W*(0.64-fp*0.34), py=H*(0.42-Math.sin(fp*Math.PI)*pl.h);
        ctx.save(); ctx.translate(px,py); ctx.rotate(fp*6.28*pl.spin*4);
        ink(0.6,1.1); sellipse(0,0,pl.sz,pl.sz*0.4,1); ctx.restore();
        if(fp>0.93&&(t%4===0)) parts.spawn({x:px,y:py,vx:rnd(-2,2),vy:rnd(-2.5,-0.5),g:0.12,life:30,r:rnd(2,4),type:'shard'});
      });
      // каракули-крик над ней
      red(0.3+rage*0.35,1.1);
      for(let i=0;i<4;i++){ const yy=H*(0.26+i*0.022); sl(W*0.6,yy,W*0.72,yy+ww(2),0.9); }
      parts.step(); parts.draw();
      ctx.restore();
      caption('летит посуда, ты нападаешь сзади',W,H);
    });

    // ── 3. он защищается кастрюлей — подарок дядьки-десантника ── 0.28–0.47
    act(p,0.28,0.47,(lp)=>{
      kitchen(W,H,0.7);
      ctx.save(); camShake(2+AUD.beat*3);
      // он с кастрюлей-щитом
      figure(W*0.34,H*0.48,{s:1.05,face:'shock',a:0.85,lean:-0.1,raiseR:0.9});
      ink(0.7,1.5); sellipse(W*0.41,H*0.36,13,15,1.3); sl(W*0.41,H*0.31,W*0.41,H*0.27,1.2); // кастрюля
      txt('подарок дядьки',W*0.41,H*0.24,12,0.35);
      // она замахивается ножом
      const sw=Math.sin(t*0.18)*0.3;
      figure(W*0.66,H*0.47,{s:1.08,face:'angry',fem:true,flip:true,a:0.9,raise:0.95,hairFlow:Math.sin(t*0.3)*8,lean:0.08});
      drawKnife(W*0.585,H*0.3,1.1,2.4+sw,0.9);
      // удары о кастрюлю → искры-звёзды в бит
      if(AUD.beat>0.7&&t%5===0){ for(let i=0;i<4;i++) parts.spawn({x:W*0.43,y:H*0.34,vx:rnd(-2.5,1),vy:rnd(-2.5,0.5),g:0.06,life:26,r:rnd(2.5,4),type:'star',col:[200,40,26]}); }
      parts.step(); parts.draw();
      ctx.restore();
      const k=1+AUD.beat*0.15;
      ctx.save(); ctx.translate(W*0.5,H*0.88); ctx.scale(k,k);
      txt('«ты умрёшь»',0,0,19,0.5,'rgba(200,40,26,0.55)'); ctx.restore();
    });

    // ── 4. семнадцать ударов: счёт, вспышки, капли ── 0.45–0.78
    act(p,0.45,0.78,(lp)=>{
      ground(W,H,H*0.8,0.2);
      const n=Math.min(17,Math.floor(lp*18.5));
      if(n>lastStab){ lastStab=n;
        for(let i=0;i<5;i++) parts.spawn({x:W*0.5+rnd(-26,26),y:H*0.5+rnd(-10,20),vx:rnd(-1.4,1.4),vy:rnd(0.5,2.4),g:0.1,life:46,r:rnd(1.6,3),type:'drop',col:[170,24,16]});
      }
      // вспышка на свежем ударе
      const fresh=lp*18.5-Math.floor(lp*18.5);
      if(n>0&&n<=17&&fresh<0.25) flash(0.07*(1-fresh*4));
      txt('17',W*0.5,H*0.6,W*0.42,0.05,'rgba(200,40,26,0.06)');
      ctx.save(); camShake(1.5+AUD.beat*4);
      figure(W*0.5,H*0.5,{s:1.12,face:n>12?'x':'sad',a:0.75,lean:Math.sin(t*0.25)*0.05+n*0.004});
      for(let i=0;i<n;i++){ const st=stabs[i];
        const ky=H*0.5+st.dy, kx=W*0.5+st.dx;
        drawKnife(kx,ky,0.85,st.ang+Math.PI,0.8);
        fred(0.45); ctx.beginPath(); ctx.arc(kx,ky+8+(i%3)*5,1.6+(i%2),0,7); ctx.fill();
      }
      ctx.restore();
      parts.step(); parts.draw();
      const k=1+AUD.beat*0.12;
      ctx.save(); ctx.translate(W*0.5,H*0.9); ctx.scale(k,k);
      txt(Math.min(n,17)+' / 17',0,0,20,0.6,'rgba(200,40,26,0.65)'); ctx.restore();
    });

    // ── 5. кровь стекает на пол, лужа растёт ── 0.74–0.9
    act(p,0.74,0.9,(lp)=>{
      ground(W,H,H*0.8,0.2);
      bled=Math.max(bled,EZ.out(lp));
      const r=bled*W*0.42;
      const g=ctx.createRadialGradient(W*0.5,H*0.79,2,W*0.5,H*0.79,Math.max(2,r));
      g.addColorStop(0,'rgba(170,24,16,0.55)'); g.addColorStop(1,'rgba(170,24,16,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.8,Math.max(2,r),Math.max(1,r*0.28),0,0,7); ctx.fill();
      ctx.save(); ctx.translate(W*0.5,H*0.71); ctx.rotate(Math.PI*0.5);
      figure(0,0,{s:0.95,a:0.55,face:'x'}); ctx.restore();
      for(let i=0;i<5;i++){ const kx=W*(0.38+i*0.06); drawKnife(kx,H*0.72,0.7,Math.PI+rnd0(i),0.45); }
      // она стоит поодаль, уже плачет
      figure(W*0.82,H*0.5,{s:0.95,face:'cry',fem:true,flip:true,a:0.5,hairFlow:Math.sin(t*0.05)*3});
      caption('прямо на пол стекает моя кровь…',W,H);
    });

    // ── 6. душа в облаках улыбается, она внизу рыдает ── 0.87–1.0
    act(p,0.87,1.0,(lp)=>{
      const rise=EZ.out(lp);
      for(let i=0;i<5;i++) cloud(W*(0.12+i*0.2)+Math.sin(t*0.01+i)*12,H*0.15+Math.cos(t*0.008+i)*8,18+i*3,0.16+rise*0.12);
      ink(0.16,0.8); for(let i=0;i<9;i++){ const rx=W*(0.1+i*0.09), ry=(H*0.22+(t*3+i*40)%(H*0.55)); sl(rx,ry,rx-1,ry+10,0.6); }
      const fy=H*(0.72-rise*0.5)+Math.sin(t*0.04)*5;
      figure(W*0.5,fy,{s:1,a:Math.max(0.3,0.75-rise*0.3),raise:0.9,face:'happy'});
      red(0.3+0.25*EZ.pulse((t%120)/120),1); scir(W*0.5,fy-46,12*kick(0.2),2);
      // она на земле, рыдает на коленях
      ground(W,H,H*0.84,0.2);
      figure(W*0.78,H*0.62,{s:0.9,sit:true,face:'cry',fem:true,flip:true,a:0.6,hairFlow:Math.sin(t*0.07)*2});
      ctx.fillStyle='rgba(60,90,170,0.25)'; ctx.beginPath(); ctx.ellipse(W*0.8,H*0.84,14+lp*10,3,0,0,7); ctx.fill();
      txt('а я плыву в облаках…',W*0.5,H*0.1,Math.min(22,W*0.04),0.55);
      caption('ты будешь плакать и рыдать',W,H,0.4);
    });

    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  }
  // детерминированный «рандом» по индексу (для статичных мелочей)
  function rnd0(i){ return ((Math.sin(i*127.1)*43758.5453)%1)*0.3; }
  f();
}


// T2 — Детская травма
// солнечная площадка (один) → травля + снег → дом, папа уходит → «детская травма»
function trauma(){
  let t=0; _pg=-1;
  const snow=mkSnow(70);
  const taunts=['урод','шлюха','один','никто'];
  const parts=mkParts(80);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        drawSun(W*0.82,H*0.18,20,0.5);
        ground(W,H,gy,0.25);
        drawSwing(W*0.36,H*0.3,H*0.34,Math.sin(t*0.03)*0.18,0.4);
        figure(W*0.18,gy-44,{s:0.8,face:'sad',a:0.6,ph:Math.sin(t*0.05)});
        figure(W*0.72,gy-40,{s:0.72,a:0.32,face:'happy',flip:true});
        figure(W*0.8,gy-40,{s:0.72,a:0.32,face:'happy'});
        caption('летом солнце ярче светит…',W,H,0.4);
      },
      (lp)=>{
        snow(W,H,0.12+lp*0.1);
        ground(W,H,gy,0.22);
        figure(W*0.3,gy-44,{s:0.85,face:'sad',a:0.6,lean:Math.sin(t*0.3)*0.04});
        if(t%24===0) parts.spawn({x:W*0.72,y:rnd(H*0.2,H*0.6),vx:-rnd(1,2.4),vy:rnd(-0.4,0.4),life:90,type:'note',txt:taunts[(t/24|0)%4],r:3,col:[150,52,52]});
        caption('таких, как ты, будут гнобить',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.2);
        ground(W,H,gy,0.2);
        drawHouse(W*0.28,gy,1.3,0.5);
        windowFrame(W*0.6,H*0.4,W*0.18,H*0.2,0.45);
        figure(W*0.69,H*0.55,{s:0.55,face:'cry',a:0.6});
        const dx=W*0.5+lp*W*0.42;
        figure(dx,gy-46,{s:0.9,a:0.4*(1-lp*0.6),face:'flat',ph:t*0.2,step:6,swing:6});
        caption('ты дома снова один, никто не любит тебя',W,H,0.45);
      },
      (lp)=>{
        for(let i=0;i<4;i++) cloud(W*(0.18+i*0.22)+Math.sin(t*0.01+i)*12,H*0.2+Math.cos(t*0.008+i)*8,16+i*3,0.18);
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-44,{s:0.85,a:0.5,face:'sad'});
        ctx.globalAlpha=0.5+0.2*EZ.pulse((t%120)/120);
        txt('детская травма',W*0.5,H*0.4,Math.min(46,W*0.11),0.7,'rgba(150,52,52,0.7)');
        ctx.globalAlpha=1;
        caption('а на небе плывут облака…',W,H,0.4);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T3 — Вся моя жизнь говно
// ссора с тёлкой → купаться в дерьме (но мне хорошо) → двор, собаки → Сатана сводный брат
function trash(){
  let t=0; _pg=-1;
  const parts=mkParts(120);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        figure(W*0.36,gy-46,{s:1,face:'angry',a:0.78,raiseR:lp*0.5});
        figure(W*0.64,gy-46,{s:1,fem:true,face:'sad',a:0.7,lean:lp*0.1,hairFlow:Math.sin(t*0.1)*4});
        if(t%30<15) txt('тупая',W*0.36,H*0.32,18,0.5,'rgba(150,52,52,0.55)');
        caption('расстанется со мной, если не перестану…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const r=W*0.3;
        const g=ctx.createRadialGradient(W*0.5,gy,4,W*0.5,gy,r);
        g.addColorStop(0,'rgba(110,72,30,0.5)'); g.addColorStop(1,'rgba(110,72,30,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(W*0.5,gy,r,r*0.3,0,0,7); ctx.fill();
        figure(W*0.5,gy-20,{s:1,face:'happy',a:0.8,ph:Math.sin(t*0.06)});
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy,vy:-rnd(0.6,1.4),life:70,type:'smoke',r:3,col:[110,72,30]});
        caption('вся моя жизнь — говно, но мне хорошо',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        bldg(W*0.05,H*0.2,W*0.25,gy,0.3,4);
        figure(W*0.45,gy-46,{s:1,face:'angry',a:0.7,raiseR:0.4});
        drawDog(W*0.62,gy-10,1,0.5,(Math.sin(t*0.2)>0));
        caption('я пинал собак с надеждой…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-58,{s:1.25,face:'flat',a:0.7});
        const sx=W*0.66,sy=gy-46;
        figure(sx,sy,{s:1,a:0.6,face:'angry'});
        red(0.6,1.6); sl(sx-7,sy-38,sx-11,sy-48,1.3); sl(sx+7,sy-38,sx+11,sy-48,1.3);
        star5(W*0.66,H*0.25,16,0.5*EZ.pulse((t%90)/90)+0.3);
        caption('Сатана — мой сводный брат',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T4 — Будка
// злой батя запрещает → план (батя→пёс) → пёс в наморднике в будке, соседи → травят
function doghouse(){
  let t=0; _pg=-1;
  const parts=mkParts(60);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        figure(W*0.3,gy-58,{s:1.3,face:'angry',a:0.8,raiseR:0.5});
        figure(W*0.62,gy-42,{s:0.85,fem:true,face:'sad',a:0.6});
        figure(W*0.78,gy-42,{s:0.85,face:'sad',a:0.5,flip:true});
        red(0.4,1.2); for(let i=0;i<3;i++){const y=H*(0.3+i*0.03); sl(W*0.36,y,W*0.46,y,1);}
        caption('твой батя запрещает со мной общаться',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        figure(W*0.3,gy-46,{s:1,face:'angry',a:0.7});
        ink(0.4,1.2); scir(W*0.6,H*0.32,W*0.13,2);
        ink(0.3,1); for(let i=0;i<3;i++) scir(W*0.45-i*8,H*0.45+i*6,3-i,1);
        ctx.save(); ctx.translate(W*0.6,H*0.32);
        ctx.globalAlpha=(1-lp); figure(0,14,{s:0.5,a:0.6,face:'angry'});
        ctx.globalAlpha=lp; drawDog(-6,8,0.7,0.6,false); ctx.restore();
        caption('но у меня есть свой план…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        if(Math.sin(t*0.3)>0.7) camShake(2);
        for(let i=0;i<3;i++) windowFrame(W*(0.05+i*0.07),H*0.2,W*0.05,H*0.08,0.3);
        ink(0.5,1.4); sl(W*0.4,gy,W*0.4,gy-50,1.3); sl(W*0.6,gy,W*0.6,gy-50,1.3);
        sl(W*0.38,gy-50,W*0.5,gy-70,1.3); sl(W*0.62,gy-50,W*0.5,gy-70,1.3);
        scir(W*0.5,gy-22,16,2);
        drawDog(W*0.5,gy-12,1.1,0.6,(Math.sin(t*0.25)>0.3));
        caption('скрипит будка, соседи не спят…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.5,1.4); sl(W*0.4,gy,W*0.4,gy-50,1.3); sl(W*0.6,gy,W*0.6,gy-50,1.3);
        sl(W*0.38,gy-50,W*0.5,gy-70,1.3); sl(W*0.62,gy-50,W*0.5,gy-70,1.3);
        drawDog(W*0.5,gy-12,1.1,0.4,false);
        if(lp>0.5){ red(0.6,1.4); const x=W*0.5,y=gy-30; sl(x-8,y-8,x+8,y+8,1.3); sl(x+8,y-8,x-8,y+8,1.3); }
        caption('соседи траванут его, всё получится',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T5 — Розовая могила
// Карина подводит глаза у зеркала → пустота (нет смысла) → розовая могила, гроб → корона, король
function grave(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const PINK=[214,110,150];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.4,1.4); srect(W*0.55,H*0.2,W*0.2,H*0.4,1.3);
        figure(W*0.4,gy-46,{s:1,fem:true,face:'calm',a:0.75,hairLong:-10,hairFlow:Math.sin(t*0.04)*3});
        ctx.save(); ctx.globalAlpha=0.4; figure(W*0.65,gy-46,{s:0.9,fem:true,face:'calm',a:0.7,flip:true}); ctx.restore();
        caption('«если уходить — уходи красиво»',W,H,0.45);
      },
      (lp)=>{
        const g=ctx.createRadialGradient(W*0.5,H*0.5,4,W*0.5,H*0.5,W*0.4);
        g.addColorStop(0,'rgba(20,16,30,0.4)'); g.addColorStop(1,'rgba(20,16,30,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'sad',a:0.5});
        caption('в жизни нету никакого смысла',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ctx.fillStyle='rgba(214,110,150,0.22)'; ctx.fillRect(W*0.38,gy-EZ.out(lp)*H*0.4,W*0.24,EZ.out(lp)*H*0.4);
        acc(0.7,1.6); srect(W*0.38,gy-H*0.4,W*0.24,H*0.4,1.5);
        txt('Карина',W*0.5,gy-H*0.3,Math.min(30,W*0.07),0.7,'rgba(214,110,150,0.85)');
        ink(0.35,1); srect(W*0.4,gy+6,W*0.2,16,1);
        caption('розовая могила, а под плитой плюшевый гроб',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        acc(0.7,1.6); srect(W*0.38,gy-H*0.4,W*0.24,H*0.4,1.5);
        const cx=W*0.5,cy=gy-H*0.4-6;
        acc(0.85,1.8); spath([[cx-22,cy],[cx-22,cy-16],[cx-11,cy-4],[cx,cy-20],[cx+11,cy-4],[cx+22,cy-16],[cx+22,cy]],true,1.6);
        if(t%20===0) parts.spawn({x:cx+rnd(-20,20),y:cy,vy:-rnd(0.4,1),life:80,type:'star',r:3,col:PINK});
        caption('живи и сдохни, как король',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T6 — Следак
// девочка на качелях → тень взрослого зовёт → пустые качели, конфета, дождь → найдись
function detective(){
  let t=0; _pg=-1;
  const rain=mkRain(40);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        drawSun(W*0.82,H*0.18,16,0.35);
        ground(W,H,gy,0.25);
        bldg(W*0.05,H*0.18,W*0.22,gy,0.25,5);
        drawSwing(W*0.5,H*0.32,H*0.34,Math.sin(t*0.04)*0.26,0.5);
        figure(W*0.5,H*0.32+H*0.27,{s:0.7,fem:true,face:'happy',a:0.7,lean:Math.sin(t*0.04)*0.26});
        caption('ты качалась во дворе',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        drawSwing(W*0.32,H*0.32,H*0.34,Math.sin(t*0.05)*0.1,0.45);
        figure(W*0.32,H*0.32+H*0.27,{s:0.7,fem:true,face:'sad',a:0.6});
        ctx.save(); ctx.globalAlpha=0.5+lp*0.3;
        figure(W*0.66,gy-50,{s:1.2,a:0.65,face:'flat',raiseL:0.4});
        ctx.restore();
        caption('пока взрослый дядька не позвал к себе',W,H,0.45);
      },
      (lp)=>{
        rain(W,H,0.25,2);
        ground(W,H,gy,0.2);
        for(let i=0;i<3;i++) cloud(W*(0.25+i*0.25),H*0.16,16,0.3);
        drawSwing(W*0.5,H*0.32,H*0.34,Math.sin(t*0.02)*0.05,0.4);
        fred(0.5); ctx.beginPath(); ctx.ellipse(W*0.5,gy-4,6,4,0,0,7); ctx.fill();
        ink(0.4,0.8); sl(W*0.47,gy-4,W*0.44,gy-6,0.7); sl(W*0.53,gy-4,W*0.56,gy-6,0.7);
        caption('тучи собрались во дворе и стали плакать',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.5,1.4); srect(W*0.38,H*0.22,W*0.24,H*0.34,1.4);
        scir(W*0.5,H*0.33,W*0.05,1.6);
        txt('?',W*0.5,H*0.355,W*0.06,0.6);
        txt('найдись',W*0.5,H*0.52,Math.min(22,W*0.05),0.6,'rgba(74,106,122,0.75)');
        const lx=W*0.72+Math.sin(t*0.03)*18,ly=H*0.42+Math.cos(t*0.04)*12;
        ink(0.5,1.6); scir(lx,ly,15,1.8); sl(lx+10,ly+10,lx+22,ly+22,2);
        caption('мы очень ждём тебя, найдись',W,H,0.5);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T7 — Черновик
// пара гуляет, шарик, туча → грузовик и колесо → он держит шар, дыра в сердце → черновик, круги
function notebook(){
  let t=0; _pg=-1;
  const parts=mkParts(60);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        cloud(W*0.7,H*0.18,18,0.3+lp*0.2);
        figure(W*0.42,gy-46,{s:0.95,face:'happy',a:0.75,ph:t*0.12,step:5,swing:5});
        figure(W*0.56,gy-46,{s:0.95,fem:true,face:'happy',a:0.75,ph:t*0.12+1,step:5,swing:5,hairFlow:Math.sin(t*0.1)*4});
        balloon(W*0.5,H*0.3+Math.sin(t*0.04)*6,14,W*0.56,gy-46,0.7);
        caption('ты любила гулять на День города',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const wx=W*0.5,wy=gy-40,wr=W*0.16;
        ink(0.6,1.8); scir(wx,wy,wr,2);
        for(let i=0;i<8;i++){const a=i/8*6.28+t*0.05; sl(wx,wy,wx+Math.cos(a)*wr,wy+Math.sin(a)*wr,0.8);}
        if(lp>0.4){ fred(0.3*EZ.pulse((t%40)/40)); ctx.beginPath(); ctx.arc(wx,wy+wr,wr*0.4,0,7); ctx.fill(); }
        if(lp>0.5) balloon(W*0.78,H*0.2-lp*40,12,W*0.78,H*0.2,0.4);
        caption('тебя намотал грузовик на огромное колесо',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.45,gy-46,{s:1,face:'sad',a:0.7});
        balloon(W*0.62,H*0.28+Math.sin(t*0.03)*8,14,W*0.45,gy-44,0.6);
        drawHeart(W*0.45,gy-30,8,0.45,[176,60,40]);
        ink(0.6,1.4); scir(W*0.45,gy-30,3.5,1.2);
        caption('в моём сердце дыра…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.2,0.7); for(let i=1;i<8;i++) sl(W*0.2,H*0.15+i*H*0.08,W*0.8,H*0.15+i*H*0.08,0.5);
        red(0.3,1); sl(W*0.26,H*0.1,W*0.26,gy,1);
        txt('черновик',W*0.5,H*0.42,Math.min(40,W*0.1),0.6,'rgba(176,60,40,0.6)');
        const cx=W*0.5+Math.cos(t*0.04)*W*0.16, cyy=gy-30+Math.sin(t*0.04)*10;
        figure(cx,cyy,{s:0.7,face:'flat',a:0.5,ph:t*0.2,step:5,swing:5});
        caption('в мире чистых листов ты теперь черновик',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// ════════════════════════════════════════════════════════════════════════════
// T8 — Ты уебалась головой  (ЭТАЛОН+++ : 12 актов, максимум деталей и сцен)
// Сквозной мотив: ФОТО пары на стене — целое в начале, трескается в момент удара,
// в финале остаётся единственным, на что он смотрит.
// Арка: комната → розлив/песни → перелом → удар у двери → семья → погоня брата →
//       флешбэк → «без тебя плохо» → пустота → сборы → поезд → мама.
// ════════════════════════════════════════════════════════════════════════════
function head(){
  let t=0; _pg=-1;
  const C=[150,52,52], WARM=[210,150,70];
  const rain=mkRain(48);
  let _hit=-1, _shatter=-1;
  const rings=[], cracks=[];
  const photoCracks=[];                                  // трещины на фото
  const gdrops=Array.from({length:24},()=>({x:rnd(0.08,0.92),y:rnd(0,1),v:rnd(0.002,0.007),len:rnd(10,26),w:rnd(0.8,1.6)}));
  const floorBottles=[{x:0.30,r:-0.3},{x:0.68,r:0.4},{x:0.5,r:0.1}];

  // ── декорации комнаты ──
  function wallpaper(W,gy,a){ ink(a,0.6); for(let i=1;i<14;i++){ const x=W*i/14; sl(x,0,x,gy*0.62,0.5);} }
  function poster(x,y,w2,h2,a){ ink(a,1.1); srect(x,y,w2,h2,1); ink(a*0.7,0.7); sl(x+3,y+h2*0.6,x+w2-3,y+h2*0.6,0.6); scir(x+w2*0.5,y+h2*0.35,h2*0.18,0.7); }
  function clock(x,y,r,a){ ink(a,1.3); scir(x,y,r,1.4); const mn=t*0.05, hr=t*0.0042; ink(a,1.4); sl(x,y,x+Math.cos(mn-1.57)*r*0.8,y+Math.sin(mn-1.57)*r*0.8,1.3); sl(x,y,x+Math.cos(hr-1.57)*r*0.5,y+Math.sin(hr-1.57)*r*0.5,1.6); fink(a); ctx.beginPath(); ctx.arc(x,y,1.4,0,7); ctx.fill(); }
  function ashtray(W,gy,a){ const x=W*0.585,y=gy*0.78; ink(a,1.1); sellipse(x,y-2,9,3,1); sl(x+5,y-3,x+13,y-9,1.1); fred(a*0.7); ctx.beginPath(); ctx.arc(x+13,y-9,1.4,0,7); ctx.fill(); if(t%24===0) emit({x:x+13,y:y-10,vy:-rnd(0.3,0.7),vx:rnd(-0.1,0.2),life:80,type:'smoke',r:1.6,col:[170,170,170]}); }
  function photoFrame(W,gy,a,cracked){
    const x=W*0.40,y=gy*0.24,w2=W*0.13,h2=gy*0.18;
    if(cracked>0.001){ ctx.save(); ctx.translate(x+w2*0.5,y+h2*0.5); ctx.rotate(0.04*cracked); ctx.translate(-(x+w2*0.5),-(y+h2*0.5)); }
    ink(a,1.4); srect(x,y,w2,h2,1.3);
    // две фигурки + сердечко (тёплое фото)
    figure(x+w2*0.36,y+h2*0.72,{s:0.34,a:a*0.9,face:'happy',breath:false,blink:false});
    figure(x+w2*0.64,y+h2*0.72,{s:0.34,a:a*0.9,fem:true,face:'happy',breath:false,blink:false});
    drawHeart(x+w2*0.5,y+h2*0.3,4,a*0.8,C);
    if(cracked>0.001){ red(0.6*cracked,1); photoCracks.forEach(c=>{ sl(x+w2*0.5,y+h2*0.4,x+w2*0.5+Math.cos(c.a)*c.l,y+h2*0.4+Math.sin(c.a)*c.l,1);}); ctx.restore(); }
  }
  function room(W,H,gy,warm){
    wallpaper(W,gy,0.10+0.05*warm);
    ink(0.30,1.2); sl(0,gy*0.62,W,gy*0.62,1);
    poster(W*0.10,gy*0.20,W*0.12,gy*0.2,0.3);
    windowFrame(W*0.70,gy*0.16,W*0.18,gy*0.30,0.32);
    if(warm>0){ const fl=0.06*warm*(0.85+0.15*Math.sin(t*0.3)); ctx.fillStyle=`rgba(210,150,70,${fl})`; ctx.fillRect(W*0.70,gy*0.16,W*0.18,gy*0.30); }
    clock(W*0.30,gy*0.22,gy*0.05,0.32);
    ground(W,H,gy,0.25);
    // бутылки на полу
    floorBottles.forEach(b=> drawBottle(W*b.x,gy,0.7,0.3,b.r+1.57));
  }
  function table(W,gy,a){ ink(a,1.4); sl(W*0.36,gy*0.78,W*0.64,gy*0.78,1.5); sl(W*0.40,gy*0.78,W*0.40,gy,1.2); sl(W*0.60,gy*0.78,W*0.60,gy,1.2); }
  function candle(W,gy,a){ const fl=Math.sin(t*0.3)*0.4+Math.sin(t*0.17)*0.2; ink(a,1); sl(W*0.49,gy*0.78,W*0.49,gy*0.72,1); sl(W*0.51,gy*0.78,W*0.51,gy*0.72,1); sl(W*0.49,gy*0.78,W*0.51,gy*0.78,1); ctx.fillStyle=`rgba(230,160,60,${a*0.85})`; ctx.beginPath(); ctx.ellipse(W*0.5+ww(0.8),gy*0.72-7,2.6*(1+fl*0.3),5.2*(1+fl*0.2),0,0,7); ctx.fill(); ctx.fillStyle=`rgba(255,210,120,${a*0.5})`; ctx.beginPath(); ctx.arc(W*0.5,gy*0.72-7,1.4+fl,0,7); ctx.fill(); }
  function boombox(W,gy,a){ const bx=W*0.78,by=gy*0.92,bw=W*0.13,bh=gy*0.11; ink(a,1.3); srect(bx,by-bh,bw,bh,1.2); const beat=AUD.beat; for(let i=0;i<2;i++){ const cx=bx+bw*(0.32+i*0.36),cy=by-bh*0.55,r=bh*0.22; ink(a,1); scir(cx,cy,r,0.9); const an=t*0.25; for(let k=0;k<3;k++){const aa=an+k*2.09; sl(cx,cy,cx+Math.cos(aa)*r,cy+Math.sin(aa)*r,0.7);} } const sc=bh*0.3*(1+beat*0.4); ink(a,1); scir(bx+bw*0.5,by-bh*0.12,sc,1); fink(a*0.4); ctx.beginPath(); ctx.arc(bx+bw*0.5,by-bh*0.12,sc*0.4,0,7); ctx.fill(); if(beat>0.4){ ink(a*beat,0.8); for(let w=1;w<=2;w++) sarc(bx+bw*0.5,by-bh*0.12,sc+w*6,-0.9,0.9,0.8);} }
  function steam(x,y,col){ if(t%20===0) emit({x:x+rnd(-2,2),y:y,vy:-rnd(0.4,0.8),vx:rnd(-0.15,0.15),life:60,type:'smoke',r:2,col:col||[180,180,180]}); }
  function door(W,gy,a){ ink(a,1.6); srect(W*0.16,gy*0.18,W*0.16,gy*0.82-gy*0.18,1.5); fink(a*0.6); ctx.beginPath(); ctx.arc(W*0.30,gy*0.55,1.8,0,7); ctx.fill(); }
  function bulb(W,gy,a){ const sw=Math.sin(t*0.05)*0.12; ctx.save(); ctx.translate(W*0.5,gy*0.12); ctx.rotate(sw); ink(a,1); sl(0,0,0,gy*0.1,0.9); scir(0,gy*0.1+5,5,1); const fl=0.6+0.4*Math.sin(t*0.4)*(Math.random()>0.04?1:0.2); ctx.fillStyle=`rgba(220,200,150,${a*0.3*fl})`; ctx.beginPath(); ctx.arc(0,gy*0.1+5,16,0,7); ctx.fill(); ctx.restore(); }
  function trainCar(x,y,w2,a,lit,chug){ ctx.save(); ctx.translate(0,chug); ink(a,1.5); srect(x,y-30,w2,30,1.5); ink(a,1.2); sl(x,y,x+w2,y,1.4); for(let wi=0;wi<2;wi++){ const cx=x+w2*(0.22+wi*0.56),cy=y+6,r=6; ink(a,1.1); scir(cx,cy,r,0.9); const an=-t*0.3; for(let k=0;k<4;k++){const aa=an+k*1.57; sl(cx,cy,cx+Math.cos(aa)*r,cy+Math.sin(aa)*r,0.7);} } for(let i=0;i<4;i++){ const wx=x+w2*(0.14+i*0.22); ctx.fillStyle=`rgba(210,150,70,${a*0.4*(lit||0)})`; ctx.fillRect(wx,y-24,w2*0.14,16); ink(a*0.8,0.9); srect(wx,y-24,w2*0.14,16,0.8);} ctx.restore(); }

  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.84;
    dust(W,H,0.04);

    // ── A1 0.00–0.10 — комната, знакомство с пространством ───────────────────
    act(p,0.00,0.10,(lp)=>{
      room(W,H,gy,1); table(W,gy,0.5); candle(W,gy,0.7); ashtray(W,gy,0.5); boombox(W,gy,0.5);
      photoFrame(W,gy,0.6,0);
      drawCat(W*0.86,gy,0.7,0.45,Math.sin(t*0.06)*0.4);
      figure(W*0.40,gy*0.78-46,{s:1,face:'happy',a:0.82,lean:Math.sin(t*0.05)*0.04});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'happy',a:0.82,hairFlow:Math.sin(t*0.06)*4});
      caption('было круто, мы сидели…',W,H,0.45);
    });

    // ── A2 0.10–0.21 — розлив, песни ─────────────────────────────────────────
    act(p,0.10,0.21,(lp)=>{
      const sway=Math.sin(t*0.06)*0.05, sing=Math.abs(Math.sin(t*0.3));
      room(W,H,gy,1); table(W,gy,0.5); candle(W,gy,0.7); ashtray(W,gy,0.5); boombox(W,gy,0.55); photoFrame(W,gy,0.6,0);
      figure(W*0.40,gy*0.78-46,{s:1,face:'happy',a:0.82,lean:sway,ph:Math.sin(t*0.1),headTilt:Math.sin(t*0.12)*0.08});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'happy',a:0.82,lean:-sway,hairFlow:Math.sin(t*0.08)*5,ph:Math.sin(t*0.1+1),headTilt:Math.sin(t*0.12+1)*0.08});
      ink(0.5,1); sarc(W*0.40,gy*0.78-71,2.5*sing+1,0.2,Math.PI-0.2,0.5); sarc(W*0.60,gy*0.78-71,2.5*sing+1,0.2,Math.PI-0.2,0.5);
      const clink=Math.sin(t*0.16);
      drawBottle(W*0.46+clink*6,gy*0.78-30,0.85,0.6,clink*0.35); drawBottle(W*0.54-clink*6,gy*0.78-30,0.85,0.6,-clink*0.35);
      // струйка при розливе
      if(Math.sin(t*0.16+1)>0.8){ ink(0.4,1); sl(W*0.46,gy*0.78-22,W*0.47,gy*0.78-8,0.8); }
      steam(W*0.46,gy*0.78-52,WARM); steam(W*0.54,gy*0.78-52,WARM);
      if(Math.abs(clink)>0.96) for(let i=0;i<4;i++) emit({x:W*0.5,y:gy*0.78-34,vx:rnd(-1.5,1.5),vy:-rnd(0.5,1.6),g:0.04,life:34,type:'star',r:1.6,col:WARM});
      if(t%12===0) emit({x:W*0.5+rnd(-70,70),y:gy*0.78-54,vy:-rnd(0.5,1.2),vx:rnd(-0.4,0.4),life:100,type:'note',txt:(t%24?'♪':'♫'),r:rnd(2.5,4),col:C});
      caption('пили водку, пели песни',W,H,0.45);
    });

    // ── A3 0.21–0.29 — перелом ───────────────────────────────────────────────
    act(p,0.21,0.29,(lp)=>{
      room(W,H,gy,1-lp); table(W,gy,0.5); candle(W,gy,0.7*(1-lp*0.6)); boombox(W,gy,0.5*(1-lp*0.5)); ashtray(W,gy,0.4);
      photoFrame(W,gy,0.6,lp*0.4);   // фото начинает крениться
      figure(W*0.40,gy*0.78-46,{s:1,face:(lp<0.5?'happy':'flat'),a:0.8,lean:Math.sin(t*0.1)*0.03});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'flat',a:0.8,lean:lp*0.2,hairFlow:Math.sin(t*0.12)*6});
      if(t%12===0) emit({x:W*0.5+rnd(-80,80),y:gy*0.78-60,vy:rnd(0.5,1.3),vx:rnd(-0.2,0.2),g:0.02,life:95,type:'note',txt:'♪',r:rnd(2,3.5),col:[120,90,90]});
      ink(0.12*lp,1); sl(W*0.60,gy,W*0.60+W*0.1*lp,gy,6);
      caption('говорили, как же нам прикольно вместе…',W,H,0.42);
    });

    // ── A4 0.29–0.40 — удар головой об дверь + фото трескается ────────────────
    act(p,0.29,0.40,(lp)=>{
      door(W,gy,0.6); ground(W,H,gy,0.25); photoFrame(W,gy,0.55, _hit>0?1:0.4);
      figure(W*0.6,gy*0.78-46,{s:1,face:'shock',a:0.75,lean:Math.sin(t*0.5)*0.03});
      const stumble=Math.min(1,lp/0.45), fall=Math.max(0,(lp-0.45)/0.55);
      ctx.save(); ctx.translate(W*(0.5-0.18*stumble)-0.06*fall*W,gy*0.78-46+EZ.in(fall)*40); ctx.rotate(fall*1.45);
      figure(0,0,{s:1,fem:true,face:(fall>0.6?'x':'shock'),a:0.78,hairFlow:fall*10}); ctx.restore();
      if(fall>0.62 && _hit<0){ _hit=t; rings.length=0; cracks.length=0; photoCracks.length=0;
        for(let k=0;k<3;k++) rings.push({age:-k*5});
        for(let c=0;c<7;c++) cracks.push({a:rnd(0,6.28),l:rnd(30,90)});
        for(let c=0;c<6;c++) photoCracks.push({a:rnd(0,6.28),l:rnd(8,22)}); }
      if(_hit>0){ const dt=t-_hit;
        if(dt<3){ flash(0.5,`rgba(150,52,52,0.5)`); camShake(6); } else if(dt<10) camShake(3*(1-dt/10));
        rings.forEach(r=>{ r.age++; if(r.age>0&&r.age<40){ ink(Math.max(0,0.6-r.age*0.015),1.4); scir(W*0.30,gy*0.78-22,r.age*4,1.2);} });
        cracks.forEach(c=>{ const k=Math.min(1,dt/12); red(0.5*(1-dt*0.01),1.2); sl(W*0.30,gy*0.78-22,W*0.30+Math.cos(c.a)*c.l*k,gy*0.78-22+Math.sin(c.a)*c.l*k,1); });
        if(dt<2) for(let i=0;i<12;i++) emit({x:W*0.30,y:gy*0.78-20,vx:rnd(-5,5),vy:-rnd(1,5),g:0.12,life:55,type:'star',r:rnd(2,4.5),col:C});
      }
      if(fall>0.5 && _shatter<0) _shatter=t;
      if(_shatter>0 && t-_shatter<2) for(let i=0;i<10;i++) emit({x:W*0.5,y:gy*0.78,vx:rnd(-3.5,3.5),vy:-rnd(0.5,2.5),g:0.15,life:50,type:'shard',r:rnd(2,4),col:[120,120,130]});
      caption('ты уебалась головой и не открываешь глаза',W,H,0.5);
    });

    // ── A5 0.40–0.50 — семья-стена ───────────────────────────────────────────
    act(p,0.40,0.50,(lp)=>{
      ground(W,H,gy,0.22);
      const stomp=Math.abs(Math.sin(t*0.35))*4;
      figure(W*(0.24-0.04*lp),gy*0.78-44,{s:0.9,face:'sad',a:0.7,lean:-0.05-Math.sin(t*0.2)*0.03});
      const adv=EZ.out(lp);
      figure(W*(0.92-0.12*adv),gy*0.78-44-stomp*0.4,{s:0.92,face:'angry',a:0.7,flip:true,ph:t*0.3});
      figure(W*(0.80-0.12*adv),gy*0.78-44-Math.abs(Math.sin(t*0.35+1))*3,{s:0.92,fem:true,face:'angry',a:0.7,flip:true});
      figure(W*(0.66-0.12*adv),gy*0.78-50-stomp,{s:1.12,face:'angry',a:0.78,raiseR:0.4+Math.sin(t*0.2)*0.15,flip:true});
      drawKnife(W*(0.60-0.12*adv),gy*0.78-58,0.7,-0.5+Math.sin(t*0.2)*0.15,0.5+0.4*Math.abs(Math.sin(t*0.2)));
      if(t%26===0) emit({x:W*(0.6-0.12*adv)+rnd(-20,20),y:gy*0.5,vy:-rnd(0.3,0.7),life:90,type:'note',txt:'₽',r:3,col:[120,100,40]});
      red(0.4+0.25*Math.sin(t*0.3),1.2); for(let i=0;i<3;i++){const yy=gy*0.4+i*8; sl(W*0.5,yy,W*0.6,yy,1);}
      if(stomp>3.6) camShake(1.2);
      caption('теперь моё имя ненавидит вся твоя семья',W,H,0.46);
    });

    // ── A6 0.50–0.58 — брат «мечтает найти»: погоня по городу ────────────────
    act(p,0.50,0.58,(lp)=>{
      // ночной город
      for(let i=0;i<5;i++) bldg(W*(0.02+i*0.2),gy*0.3,W*0.15,gy*0.86,0.2,4);
      drawMoon(W*0.86,gy*0.14,13,0.4);
      ground(W,H,gy,0.2);
      // прожектор-поиск (конус качается)
      const sweep=Math.sin(t*0.04)*0.5;
      ctx.save(); ctx.globalAlpha*=0.18; ctx.fillStyle='rgba(220,200,140,1)';
      ctx.beginPath(); ctx.moveTo(W*0.5,0); ctx.lineTo(W*0.5+Math.cos(1.2+sweep)*H,Math.sin(1.2+sweep)*H); ctx.lineTo(W*0.5+Math.cos(1.9+sweep)*H,Math.sin(1.9+sweep)*H); ctx.closePath(); ctx.fill(); ctx.restore();
      // он бежит влево, брат догоняет справа с ножом
      const run=t*0.3;
      figure(W*(0.34-0.04*Math.sin(lp*6)),gy*0.78-44,{s:0.85,face:'shock',a:0.7,ph:run,step:8,swing:8,lean:-0.12});
      figure(W*(0.62-0.1*advSafe(lp)),gy*0.78-46,{s:1,face:'angry',a:0.72,ph:run+1,step:8,swing:8,lean:-0.1,raiseR:0.4,flip:true});
      drawKnife(W*(0.56-0.1*advSafe(lp)),gy*0.78-54,0.65,-0.6+Math.sin(run)*0.1,0.55);
      caption('и твой брат мечтает найти и по частям продать меня',W,H,0.46);
    });

    // ── A7 0.58–0.66 — флешбэк ───────────────────────────────────────────────
    act(p,0.58,0.66,(lp)=>{
      ctx.globalAlpha*=0.6+0.2*EZ.pulse((t%30)/30);
      door(W,gy,0.35); ground(W,H,gy,0.18);
      ink(0.06,0.6); for(let y=0;y<gy;y+=4) sl(0,y+(t%4),W,y+(t%4),0.5);
      for(let g=0;g<3;g++){ const loop=((t+g*13)%40)/40; ctx.save(); ctx.globalAlpha*=(0.5-g*0.13); ctx.translate(W*0.34,gy*0.78-46+EZ.in(loop)*40); ctx.rotate(loop*1.4); figure(0,0,{s:0.95,fem:true,face:'x',a:0.5,hairFlow:loop*8}); ctx.restore(); }
      if((t%40)<2) for(let i=0;i<6;i++) emit({x:W*0.30,y:gy*0.78-20,vx:rnd(-3,3),vy:-rnd(1,3),life:42,type:'star',r:2,col:[120,90,90]});
      caption('а я не могу забыть, как ты об дверь убилась',W,H,0.5);
    });

    // ── A8 0.66–0.74 — «без тебя плохо»: падает на колени ─────────────────────
    act(p,0.66,0.74,(lp)=>{
      room(W,H,gy,0.15); table(W,gy,0.35); photoFrame(W,gy,0.45,1);
      const knee=EZ.out(Math.min(1,lp*1.3));
      ctx.save(); ctx.translate(W*0.5,gy*0.78-46+knee*20); ctx.scale(1,1-knee*0.2);
      figure(0,0,{s:1,face:'cry',a:0.72,raiseL:0.3*knee,raiseR:0.3*knee,headTilt:knee*0.2}); ctx.restore();
      // десатурация-воронка
      const g=ctx.createRadialGradient(W*0.5,gy*0.5,4,W*0.5,gy*0.5,W*0.45); g.addColorStop(0,'rgba(20,16,16,0)'); g.addColorStop(1,`rgba(20,16,16,${0.25*lp})`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      caption('боже мой, без тебя мне стало плохо',W,H,0.5);
    });

    // ── A9 0.74–0.82 — пустота ───────────────────────────────────────────────
    act(p,0.74,0.82,(lp)=>{
      room(W,H,gy,0.12); table(W,gy,0.4); bulb(W,gy,0.6); photoFrame(W,gy,0.4,1);
      figure(W*0.40,gy*0.78-30,{s:0.95,face:'sad',a:0.7,sit:true,headTilt:0.12+Math.sin(t*0.03)*0.03});
      ink(0.3,1); sl(W*0.60,gy*0.78,W*0.60,gy,1); sl(W*0.56,gy*0.78,W*0.64,gy*0.78,1);
      drawBottle(W*0.5,gy*0.78-30,0.85,0.45,Math.sin(t*0.03)*0.05);
      if(t%70<2) emit({x:W*0.5,y:gy*0.78,vy:rnd(0.8,1.2),g:0.05,life:50,type:'drop',r:1.6,col:[120,90,90]});
      const ny=gy*0.78-50-Math.max(0,Math.sin(t*0.04))*40; txt('♪',W*0.5,ny,16,0.4,'rgba(120,90,90,0.5)');
      caption('с кем теперь мне слушать песни?',W,H,0.46);
    });

    // ── A10 0.82–0.89 — сборы: рюкзак, уходит из квартиры ────────────────────
    act(p,0.82,0.89,(lp)=>{
      room(W,H,gy,0.1); door(W,gy,0.5);
      // он идёт к двери с рюкзаком
      const wx=W*(0.5-0.2*lp);
      figure(wx,gy*0.78-46,{s:1,face:'sad',a:0.72,ph:t*0.2,step:6,swing:4,lean:-0.05});
      ink(0.6,1.3); srect(wx-16,gy*0.78-44,12,18,1.2); sl(wx-12,gy*0.78-44,wx-6,gy*0.78-52,1); // рюкзак за спиной
      // фото остаётся на стене
      photoFrame(W,gy,0.4,1);
      caption('я съезжаю в другой город…',W,H,0.46);
    });

    // ── A11 0.89–0.95 — поезд уезжает ────────────────────────────────────────
    act(p,0.89,0.95,(lp)=>{
      const off=lp*W*0.6, off2=lp*W*1.1;
      for(let i=0;i<5;i++){ const bx=((i*W*0.30 - off)%(W*1.5)+W*1.5)%(W*1.5)-W*0.15; bldg(bx,gy*0.34,W*0.16,gy*0.86,0.16,5); }
      drawMoon(W*0.84,gy*0.16,15,0.4);
      ground(W,H,gy,0.2); ink(0.3,1); sl(0,gy*0.9,W,gy*0.9,1);
      for(let i=0;i<4;i++){ const lx=((i*W*0.34 - off2)%(W*1.4)+W*1.4)%(W*1.4)-W*0.1; ink(0.3,1.2); sl(lx,gy*0.9,lx,gy*0.5,1.1); sl(lx,gy*0.5,lx+10,gy*0.5,1); sarc(lx-30,gy*0.5,30,-0.5,0,0.8); }
      const chug=Math.sin(t*0.4)*1.6, carX=W*0.20+EZ.out(Math.min(1,lp*1.4))*W*0.12;
      trainCar(carX,gy*0.86,W*0.5,0.7,1,chug);
      figure(carX+W*0.12,gy*0.86-44+chug,{s:0.5,face:'sad',a:0.7});
      if(t%8===0) emit({x:carX-6,y:gy*0.86-30,vy:-rnd(0.5,1.1),vx:-rnd(0.4,0.9),life:75,type:'smoke',r:rnd(2,4),col:[120,120,120]});
      caption('я съезжаю в другой город, мама…',W,H,0.46);
    });

    // ── A12 0.95–1.00 — мама вдали ───────────────────────────────────────────
    act(p,0.95,1.00,(lp)=>{
      ground(W,H,gy,0.18); rain(W,H,0.16,3);
      const mamaY=gy*0.78-30;
      figure(W*(0.72+0.06*lp),mamaY,{s:0.5+0.1*(1-lp),fem:true,a:0.42*(1-lp*0.4),face:'sad',raiseR:0.6+Math.sin(t*0.18)*0.25});
      figure(W*0.30,gy*0.78-44,{s:0.95,face:'cry',a:0.72,headTilt:Math.sin(t*0.04)*0.04});
      ctx.fillStyle=`rgba(210,150,70,${0.18*(1-lp*0.5)})`; ctx.beginPath(); ctx.arc(W*0.74,mamaY-30,18+Math.sin(t*0.1)*2,0,7); ctx.fill();
      const fog=0.05+0.04*Math.sin(t*0.08); ctx.fillStyle=`rgba(200,200,210,${fog})`; ctx.beginPath(); ctx.ellipse(W*0.30,gy*0.5,40,55,0,0,7); ctx.fill();
      ink(0.4,2); srect(W*0.06,gy*0.12,W*0.88,gy*0.78,1.8); sl(W*0.5,gy*0.12,W*0.5,gy*0.9,1.2);
      ink(0.35,1); gdrops.forEach(d=>{ d.y+=d.v; if(d.y>1){d.y=-0.05;d.x=rnd(0.08,0.92);} const x=W*(0.06+d.x*0.88),y=gy*0.12+d.y*gy*0.78; sl(x,y,x,y-d.len,d.w); fink(0.4); ctx.beginPath(); ctx.arc(x,y,d.w,0,7); ctx.fill(); });
      writeOn('мама, я люблю тебя',W*0.5,gy*0.34,Math.min(30,W*0.07),EZ.out(lp),0.78,'rgba(150,52,52,0.82)');
      if(t%26===0) emit({x:W*0.30,y:gy*0.78-40,vy:rnd(0.8,1.4),life:50,type:'drop',r:2,col:[60,90,170]});
    });

    flushParts();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
function advSafe(lp){ return lp<0?0:lp>1?1:(1-Math.pow(1-lp,3)); }


// T9 — Первокурсница
// девушка у окна, кто-то смотрит → одна, как взаперти → мужчины, что любят силой → тебя красивую
function student(){
  let t=0; _pg=-1;
  const parts=mkParts(70);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        windowFrame(W*0.34,H*0.22,W*0.3,H*0.46,0.5);
        figure(W*0.49,gy-46,{s:0.95,fem:true,face:'calm',a:0.7,hairLong:-12,hairFlow:Math.sin(t*0.03)*3});
        // глаз в окне напротив
        ink(0.4,1.2); sellipse(W*0.82,H*0.3,12,6,1.2); fink(0.5); ctx.beginPath(); ctx.arc(W*0.82,H*0.3,3,0,7); ctx.fill();
        caption('кто-то смотрит на тебя из окна',W,H,0.45);
      },
      (lp)=>{
        // решётка-взаперти
        const g=ctx.createRadialGradient(W*0.5,H*0.5,4,W*0.5,H*0.5,W*0.45);
        g.addColorStop(0,'rgba(150,90,170,0.12)'); g.addColorStop(1,'rgba(20,16,30,0.3)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'sad',a:0.6});
        ink(0.3,1.2); for(let i=0;i<5;i++) sl(W*(0.3+i*0.1),H*0.12,W*(0.3+i*0.1),gy,1);
        caption('пусто одной, как взаперти',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.62,gy-46,{s:0.9,fem:true,face:'shock',a:0.6});
        // мужчина-сила: тёмный, кулак
        figure(W*0.36,gy-50,{s:1.15,a:0.7,face:'angry',raiseR:0.5});
        const fx=W*0.36+18,fy=gy-50-30*0.5;
        ink(0.7,1.6); scir(fx,fy-6,6,1.4);
        if(t%30<15){ acc(0.5,1.2); for(let i=0;i<3;i++) sl(W*0.5,H*(0.3+i*0.03),W*0.56,H*(0.3+i*0.03),1); }
        caption('тебе нравятся мужчины, что любят силой',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,fem:true,face:'calm',a:0.7,hairLong:-12,hairFlow:Math.sin(t*0.04)*4});
        if(t%24===0) parts.spawn({x:W*0.5+rnd(-50,50),y:gy-60,vy:-rnd(0.3,0.8),life:90,type:'heart',r:rnd(3,5),col:[150,90,170]});
        txt('тебя красивую',W*0.5,H*0.28,Math.min(26,W*0.06),0.5,'rgba(150,90,170,0.55)');
        caption('тебя красивую, тебя красивую',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T10 — ЗППП
// влечение друг к другу → «зараза» течёт между ними (дым) → ВИЧ-хаус, вместе → тонут в Неве
function pills(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[130,42,90];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.38,gy-46,{s:1,face:'happy',a:0.72,lean:lp*0.06});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'happy',a:0.72,lean:-lp*0.06,hairFlow:Math.sin(t*0.06)*4});
        if(t%30===0) parts.spawn({x:W*0.5,y:gy-60,vy:-rnd(0.3,0.7),life:80,type:'heart',r:4,col:C});
        caption('я так хочу заразиться тобою',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.34,gy-46,{s:1,face:'flat',a:0.7});
        figure(W*0.66,gy-46,{s:1,fem:true,face:'flat',a:0.7});
        // дым-зараза течёт изо рта в рот
        for(let i=0;i<2;i++){const x=W*0.4+Math.sin(t*0.05+i*3)*W*0.1+i*W*0.05; parts.spawn({x:x,y:gy-58,vx:0.6,vy:Math.sin(t*0.1)*0.3,life:60,type:'smoke',r:rnd(2,4),col:C});}
        caption('как дым сигарет, я проникну в твой рот',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawHouse(W*0.5,gy,1.6,0.55);
        ctx.fillStyle=`rgba(130,42,90,${0.12+0.06*EZ.pulse((t%90)/90)})`; ctx.fillRect(W*0.5-38,gy-42,76,42);
        figure(W*0.44,gy-30,{s:0.55,a:0.55,face:'flat'});
        figure(W*0.56,gy-30,{s:0.55,fem:true,a:0.55,face:'flat'});
        txt('ВИЧ-хаус',W*0.5,H*0.2,Math.min(24,W*0.055),0.5,'rgba(130,42,90,0.6)');
        caption('у нас ВИЧ-хаус, о боже',W,H,0.45);
      },
      (lp)=>{
        // Нева поднимается
        const wl=gy-EZ.io(lp)*H*0.5;
        figure(W*0.5,wl-30,{s:0.9,a:0.5,face:'calm',raise:0.3});
        ctx.fillStyle='rgba(74,106,122,0.25)'; ctx.fillRect(0,wl,W,H-wl);
        ink(0.4,1); for(let i=0;i<4;i++){const yy=wl+i*12; sl(0,yy+Math.sin(t*0.06+i)*4,W,yy+Math.cos(t*0.06+i)*4,1);}
        if(t%14===0) parts.spawn({x:W*0.5+rnd(-30,30),y:wl,vy:-rnd(0.5,1.2),life:40,type:'drop',r:2,col:[74,106,122]});
        caption('а после утонем с тобою в Неве',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T11 — Станцуй со мной
// приглашение (рука) → танец вдвоём → глаза как яд → кружащийся танец, яд+сердца
function dance(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[200,74,106];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'calm',a:0.75,raiseR:0.6});
        figure(W*0.64,gy-46,{s:1,fem:true,face:'shy',a:0.7,hairFlow:Math.sin(t*0.05)*4});
        caption('станцуй со мной…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const sw=Math.sin(t*0.08)*0.12;
        figure(W*0.44,gy-46,{s:1,face:'happy',a:0.78,lean:sw,raiseR:0.5});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'happy',a:0.78,lean:-sw,raiseL:0.5,hairFlow:Math.sin(t*0.1)*6});
        if(t%26===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy-50,vy:-rnd(0.4,0.9),life:80,type:'note',txt:'♪',r:3,col:C});
        caption('ведь ты мне сильно нравишься',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,fem:true,face:'flat',a:0.7,hairFlow:Math.sin(t*0.06)*4});
        // ядовитые зелёные глаза
        ctx.fillStyle=`rgba(80,150,70,${0.6+0.3*EZ.pulse((t%60)/60)})`;
        ctx.beginPath(); ctx.arc(W*0.5-4,gy-48,2,0,7); ctx.arc(W*0.5+4,gy-48,2,0,7); ctx.fill();
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-6,6),y:gy-46,vy:rnd(0.5,1.2),life:60,type:'drop',r:2,col:[80,150,70]});
        caption('твои глаза как яд',W,H,0.45);
      },
      (lp)=>{
        // кружение
        const cx=W*0.5,cy=gy-40,R=W*0.1;
        const a1=t*0.06;
        figure(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R*0.4,{s:0.95,face:'happy',a:0.72,lean:Math.sin(a1)*0.2});
        figure(cx+Math.cos(a1+Math.PI)*R,cy+Math.sin(a1+Math.PI)*R*0.4,{s:0.95,fem:true,face:'happy',a:0.72,lean:Math.sin(a1+Math.PI)*0.2,hairFlow:6});
        if(t%14===0) parts.spawn({x:cx+rnd(-50,50),y:cy-rnd(0,40),vy:-rnd(0.3,0.8),life:90,type:(t%28===0?'heart':'star'),r:rnd(3,5),col:C});
        caption('может быть, я поехал головой — станцуй со мной',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T12 — Верёвка
// дети на площадке, она целует другого → он смотрит вверх, самолёт падает → верёвка на ветке → пусто
function rope(){
  let t=0; _pg=-1;
  const parts=mkParts(60);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        drawSwing(W*0.2,H*0.34,H*0.3,Math.sin(t*0.04)*0.2,0.4);
        // она целует другого
        figure(W*0.6,gy-44,{s:0.9,fem:true,face:'happy',a:0.6,hairFlow:Math.sin(t*0.06)*3});
        figure(W*0.7,gy-44,{s:0.9,face:'happy',a:0.6,flip:true});
        if(t%40<20) drawHeart(W*0.65,gy-58,6,0.4,[200,40,80]);
        caption('пока твои губы других губ касаются',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.3,gy-44,{s:0.95,face:'sad',a:0.65,headTilt:-0.3});
        // самолёт падает
        const px=W*0.5+lp*W*0.3, py=H*0.15+EZ.in(lp)*H*0.4;
        ink(0.6,1.4); ctx.save(); ctx.translate(px,py); ctx.rotate(0.6+lp*0.5);
        sl(-14,0,14,0,1.4); sl(-6,0,-12,-7,1.1); sl(-6,0,-12,7,1.1); sl(8,0,2,-5,1); ctx.restore();
        ink(0.3,0.8); for(let i=0;i<6;i++) sl(px-14-i*8,py-i*2,px-20-i*8,py-i*2,0.6);
        caption('самолёт падает с неба, видимо, песня спета',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawTree(W*0.7,gy,1.6,0.5,Math.sin(t*0.02)*3);
        // верёвка качается на ветке (силуэт, сдержанно)
        const sway=Math.sin(t*0.03)*0.1;
        ctx.save(); ctx.translate(W*0.62,gy-H*0.42); ctx.rotate(sway);
        ink(0.5,1.4); sl(0,0,0,H*0.18,1.3); scir(0,H*0.18+10,10,1.4); ctx.restore();
        caption('верёвка веткам шепчет…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawSwing(W*0.5,H*0.32,H*0.32,Math.sin(t*0.015)*0.04,0.35);
        // вдали дым от падения
        for(let i=0;i<3;i++) cloud(W*0.8,H*0.2+i*4,12,0.2);
        ctx.globalAlpha=0.5;
        txt('меня уже ничего не бесит',W*0.5,H*0.3,Math.min(22,W*0.05),0.5);
        ctx.globalAlpha=1;
        caption('мне тебя любить уже вряд ли нравится',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T13 — Я без ума от тебя
// танец в такт → «сделаем облака» в квартире → без ума, сердца → оба под капюшоном, заражён
function heart(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[200,40,80];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        const sw=Math.sin(t*0.1)*0.1;
        figure(W*0.43,gy-46,{s:1,face:'happy',a:0.78,lean:sw});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'happy',a:0.78,lean:-sw,hairFlow:Math.sin(t*0.1)*5});
        caption('наши тела двигались в такт',W,H,0.45);
      },
      (lp)=>{
        // комната + облака дыма внутри
        ink(0.4,1.3); srect(W*0.2,H*0.18,W*0.6,gy-H*0.18,1.3);
        for(let i=0;i<3;i++) cloud(W*(0.35+i*0.18)+Math.sin(t*0.02+i)*8,H*0.32+Math.cos(t*0.02+i)*6,14,0.3);
        figure(W*0.4,gy-44,{s:0.85,a:0.6,face:'calm'});
        figure(W*0.6,gy-44,{s:0.85,fem:true,a:0.6,face:'calm'});
        caption('сделаем в нашей квартире облака',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,face:'love',a:0.78});
        if(t%8===0) parts.spawn({x:W*0.5+rnd(-60,60),y:gy-rnd(20,80),vy:-rnd(0.4,1.1),vx:rnd(-0.3,0.3),life:90,type:'heart',r:rnd(3,6),col:C});
        caption('я без ума от тебя, я без ума',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // оба под капюшонами
        figure(W*0.42,gy-46,{s:1,a:0.65,face:'flat',hair:'none'});
        figure(W*0.58,gy-46,{s:1,fem:true,a:0.65,face:'flat',hair:'none'});
        ink(0.6,1.4); sarc(W*0.42,gy-34,12,Math.PI*1.1,Math.PI*1.9,1.2); sarc(W*0.58,gy-34,12,Math.PI*1.1,Math.PI*1.9,1.2);
        if(t%16===0) parts.spawn({x:rnd(W*0.4,W*0.6),y:gy-50,vy:-rnd(0.3,0.7),life:80,type:'heart',r:4,col:C});
        caption('а я тобою заражён',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T14 — Север
// студентка с книгами → юг→север, компас, ветер → полёт к ней → компас крутится, путь
function north(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const snow=mkSnow(40);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1,fem:true,face:'sad',a:0.72,hairFlow:Math.sin(t*0.04)*3});
        ink(0.5,1.3); srect(W*0.42,gy-18,W*0.16,14,1.2); txt('ВУЗ',W*0.5,gy-7,12,0.5);
        for(let i=0;i<3;i++) parts.spawn&&(t%30===0&&parts.spawn({x:W*0.5,y:gy-60,vy:-0.5,life:60,type:'note',txt:'5',r:2,col:[70,90,140]}));
        caption('ты училась на отлично, тебя заебал твой ВУЗ',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.14);
        // компас
        const cx=W*0.5,cy=H*0.42,r=W*0.16;
        ink(0.5,1.6); scir(cx,cy,r,2);
        txt('С',cx,cy-r+14,16,0.6); txt('Ю',cx,cy+r-4,16,0.5);
        const a1=-Math.PI/2; ink(0.7,2); sl(cx,cy,cx+Math.cos(a1)*r*0.7,cy+Math.sin(a1)*r*0.7,2);
        caption('мы с юга на север',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.16);
        ground(W,H,gy,0.2);
        // машина-полёт
        const mx=W*0.2+lp*W*0.6;
        ink(0.6,1.5); srect(mx,gy-26,W*0.18,18,1.4); scir(mx+W*0.04,gy-8,6,1.1); scir(mx+W*0.14,gy-8,6,1.1);
        ink(0.3,0.9); for(let i=0;i<5;i++) sl(mx-i*10,gy-18-i,mx-10-i*10,gy-18-i,0.7);
        caption('я к тебе лечу, пересекаю север',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.18);
        const cx=W*0.5,cy=H*0.44,r=W*0.15;
        ink(0.5,1.6); scir(cx,cy,r,2);
        const a1=t*0.08; ink(0.7,2); sl(cx,cy,cx+Math.cos(a1)*r*0.7,cy+Math.sin(a1)*r*0.7,2);
        figure(W*0.5,gy-30,{s:0.7,fem:true,a:0.4,face:'calm'});
        caption('пересекаю юг, пересекаю юг',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T15 — Вата
// чёрт таращит глаза → пьяные, трясёт под одеялом → колени-вата, гнётся, ванна → месиво
function cotton(){
  let t=0; _pg=-1;
  const parts=mkParts(110);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        // чёрт — большие глаза в темноте
        const g=ctx.createRadialGradient(W*0.5,H*0.4,4,W*0.5,H*0.4,W*0.5);
        g.addColorStop(0,'rgba(160,120,60,0.12)'); g.addColorStop(1,'rgba(16,10,6,0.4)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        const ey=H*0.36, ex=W*0.5, s2=1+0.1*Math.sin(t*0.1);
        ink(0.6,1.6); sellipse(ex-W*0.08,ey,18*s2,11,1.6); sellipse(ex+W*0.08,ey,18*s2,11,1.6);
        fred(0.6); ctx.beginPath(); ctx.arc(ex-W*0.08,ey,5,0,7); ctx.arc(ex+W*0.08,ey,5,0,7); ctx.fill();
        red(0.5,1.5); sl(ex-W*0.04,ey-26,ex-W*0.07,ey-38,1.3); sl(ex+W*0.04,ey-26,ex+W*0.07,ey-38,1.3);
        caption('на нас пялится чёрт, таращит свои глаза',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // одеяло дрожит
        const sh=Math.sin(t*0.5)*3;
        ink(0.5,1.4); ctx.beginPath(); ctx.moveTo(W*0.32,gy);
        for(let i=0;i<=8;i++){const x=W*0.32+i/8*W*0.36; ctx.lineTo(x,gy-30-Math.sin(i+t*0.3)*6+sh);} ctx.lineTo(W*0.68,gy); ctx.stroke();
        figure(W*0.4,gy-30,{s:0.7,a:0.5,face:'flat'});
        figure(W*0.58,gy-30,{s:0.7,fem:true,a:0.5,face:'sad',lean:Math.sin(t*0.4)*0.06});
        caption('я пьяный, а тебя трясёт под одеялом',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // гнётся как забор, колени-вата
        figure(W*0.4,gy-44,{s:1,face:'flat',a:0.65,lean:Math.sin(t*0.06)*0.3});
        // ванна
        ink(0.5,1.4); sellipse(W*0.66,gy-8,W*0.13,16,1.4); sl(W*0.53,gy-8,W*0.53,gy-26,1.2); sl(W*0.79,gy-8,W*0.79,gy-26,1.2);
        caption('мои колени — вата, шоу там, где твоя ванна',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // месиво — хаотичные штрихи + обнимаются
        figure(W*0.46,gy-44,{s:0.95,a:0.6,face:'flat',raiseR:0.4});
        figure(W*0.56,gy-44,{s:0.95,fem:true,a:0.6,face:'flat',raiseL:0.4});
        ink(0.3,1); for(let i=0;i<10;i++){const x=rnd(W*0.2,W*0.8),y=rnd(H*0.2,gy); sl(x,y,x+rnd(-20,20),y+rnd(-20,20),0.8);}
        if(t%20===0) parts.spawn({x:rnd(W*0.3,W*0.7),y:rnd(H*0.3,gy),vx:rnd(-1,1),vy:rnd(-1,1),life:50,type:'dot',r:2,col:[160,120,60]});
        caption('в нашей хате месиво',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T16 — Напорносайтах
// батя и собаки (стыд) → даже собакам не нравится → за компом, порносайты (свечение) → весь день ничего
function browser(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.34,gy-46,{s:1,face:'flat',a:0.5});
        drawDog(W*0.56,gy-10,1,0.5,false);
        drawDog(W*0.72,gy-10,0.9,0.45,false);
        // знак стыда
        txt('…',W*0.34,H*0.32,24,0.4);
        caption('мой батя совокупляется с собаками',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'sad',a:0.65});
        // собака отворачивается
        drawDog(W*0.62,gy-10,1.1,0.5,false);
        ink(0.4,1); sl(W*0.55,gy-22,W*0.5,gy-26,0.8);
        caption('моё лицо даже собакам не нравится',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // фигура за монитором, свечение
        figure(W*0.42,gy-30,{s:0.9,a:0.6,face:'flat',sit:true});
        const glow=0.2+0.15*Math.sin(t*0.2);
        ctx.fillStyle=`rgba(100,100,110,${glow})`; ctx.fillRect(W*0.55,gy-50,W*0.22,34);
        ink(0.5,1.4); srect(W*0.55,gy-50,W*0.22,34,1.3); sl(W*0.66,gy-16,W*0.66,gy-6,1.2); sl(W*0.6,gy-6,W*0.72,gy-6,1.2);
        // censored bars
        fink(0.4); for(let i=0;i<3;i++) ctx.fillRect(W*0.57,gy-44+i*10,W*0.18,5);
        caption('поэтому я сижу на порносайтах',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-30,{s:0.9,a:0.55,face:'flat',sit:true,headTilt:0.2});
        // часы-время идёт
        ink(0.4,1.3); scir(W*0.72,H*0.28,18,1.6);
        const a1=t*0.05; sl(W*0.72,H*0.28,W*0.72+Math.cos(a1)*12,H*0.28+Math.sin(a1)*12,1.4);
        sl(W*0.72,H*0.28,W*0.72+Math.cos(a1*0.1)*8,H*0.28+Math.sin(a1*0.1)*8,1.2);
        caption('я ничего не делал весь день',W,H,0.45);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T17 — По барабану
// падик 3 утра → взрыв вулкана (взорвёмся) → ванна, облака, курит → летать где-то
function drum(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[210,90,40];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        bldg(W*0.1,H*0.14,W*0.5,gy,0.35,6);
        drawMoon(W*0.82,H*0.18,16,0.5);
        figure(W*0.66,gy-44,{s:0.9,a:0.65,face:'calm'});
        figure(W*0.76,gy-44,{s:0.9,fem:true,a:0.65,face:'calm',hairFlow:Math.sin(t*0.05)*3});
        caption('твой падик родней, три утра',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // вулкан
        ink(0.6,1.6); sl(W*0.3,gy,W*0.44,gy-H*0.4,1.5); sl(W*0.7,gy,W*0.56,gy-H*0.4,1.5);
        // извержение по биту
        const burst=EZ.bounce(lp)+AUD.beat;
        if(t%4===0) for(let i=0;i<3;i++) parts.spawn({x:W*0.5+rnd(-14,14),y:gy-H*0.4,vx:rnd(-3,3),vy:-rnd(3,7)*(0.6+burst),g:0.12,life:70,type:(i%2?'shard':'dot'),r:rnd(2,4),col:C});
        caption('а давай по фану взорвёмся, подобно вулкану',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // ванна + облака
        ink(0.5,1.4); sellipse(W*0.5,gy-10,W*0.16,18,1.4);
        for(let i=0;i<3;i++) cloud(W*(0.36+i*0.16)+Math.sin(t*0.02+i)*6,H*0.3,12,0.3);
        figure(W*0.5,gy-30,{s:0.7,fem:true,a:0.6,face:'calm',hairFlow:Math.sin(t*0.06)*4});
        // дым сигареты
        if(t%20===0) parts.spawn({x:W*0.54,y:gy-44,vy:-rnd(0.5,1),vx:0.2,life:70,type:'smoke',r:3,col:[150,150,150]});
        caption('в ванной облака, ты куришь сигу',W,H,0.45);
      },
      (lp)=>{
        // летят
        for(let i=0;i<4;i++) cloud(W*(0.15+i*0.22)+Math.sin(t*0.01+i)*10,H*0.5+Math.cos(t*0.01+i)*30,14,0.2);
        figure(W*0.42,H*0.4+Math.sin(t*0.03)*10,{s:0.9,a:0.6,face:'happy',raise:0.7});
        figure(W*0.58,H*0.42+Math.cos(t*0.03)*10,{s:0.9,fem:true,a:0.6,face:'happy',raise:0.7,hairFlow:6});
        caption('давай летать где-то, давай представим',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T18 — Велосипед
// звонок, музыка играет → катит на велосипеде вдвоём → взрыв дома → психопат следит, придумал мир
function bicycle(){
  let t=0; _pg=-1;
  const parts=mkParts(120);
  const C=[60,140,90];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'happy',a:0.72,raiseR:0.5});
        drawPhone(W*0.4+20,gy-60,1,0.6,0.6+0.4*Math.sin(t*0.2));
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-30,30),y:gy-50,vy:-rnd(0.4,1),vx:rnd(-0.3,0.3),life:90,type:'note',txt:'♪',r:rnd(2,4),col:C});
        caption('моя музыка будет играть для тебя',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // едут на велосипеде
        const bx=W*0.2+lp*W*0.55;
        drawBike(bx,gy-14,1,0.7,t*0.2);
        figure(bx-2,gy-44,{s:0.7,a:0.7,face:'happy',ph:t*0.2,raiseR:0.3});
        figure(bx+12,gy-40,{s:0.6,fem:true,a:0.6,face:'happy',hairFlow:6});
        ink(0.3,0.8); for(let i=0;i<4;i++) sl(bx-26-i*10,gy-14,bx-34-i*10,gy-14,0.7);
        caption('я прокачу тебя на велосипеде',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawHouse(W*0.5,gy,1.5,0.5);
        // взрыв
        const burst=EZ.out(lp);
        if(t%3===0) for(let i=0;i<4;i++) parts.spawn({x:W*0.5+rnd(-30,30),y:gy-40,vx:rnd(-5,5)*burst,vy:-rnd(2,7)*burst,g:0.15,life:60,type:(i%2?'shard':'dot'),r:rnd(2,5),col:[210,90,40]});
        ctx.fillStyle=`rgba(210,90,40,${0.15*burst*EZ.pulse((t%30)/30)})`; ctx.beginPath(); ctx.arc(W*0.5,gy-40,W*0.2*burst,0,7); ctx.fill();
        caption('взорву свой дом, а после разделю с тобой вечер',W,H,0.5);
      },
      (lp)=>{
        // сюр: следит, придумал мир
        ground(W,H,gy,0.2);
        bldg(W*0.05,H*0.2,W*0.2,gy,0.3,4); bldg(W*0.75,H*0.2,W*0.2,gy,0.3,4);
        figure(W*0.5,gy-46,{s:0.95,a:0.6,face:'flat'});
        // глаза-слежка
        for(let i=0;i<4;i++){const x=rnd(W*0.1,W*0.9),y=rnd(H*0.15,H*0.5); ink(0.3,1); sellipse(x,y,8,4,1); fink(0.4); ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fill();}
        if(t%30===0) parts.spawn({x:W*0.5,y:H*0.2,vy:0.3,life:120,type:'star',r:3,col:C});
        caption('я этот мир придумал — это факт',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T19 — Малолетки
// малолетки беснуются (тусят) → ты хочешь со мной (не верится) → ночь, грусть, фото → бутылка, падик
function teens(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[180,80,140];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // толпа малолеток бесится
        for(let i=0;i<5;i++){const x=W*(0.12+i*0.16); figure(x,gy-40,{s:0.7,a:0.4,face:'happy',ph:t*0.2+i,raise:Math.abs(Math.sin(t*0.15+i))*0.8});}
        if(t%10===0) parts.spawn({x:rnd(W*0.1,W*0.9),y:gy-60,vy:-rnd(0.5,1.5),life:50,type:'star',r:2,col:C});
        caption('пока малолетки бесятся',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'shock',a:0.7});
        figure(W*0.6,gy-46,{s:1,fem:true,face:'calm',a:0.7,hairFlow:Math.sin(t*0.05)*4});
        if(t%30<15) txt('?!',W*0.4,H*0.3,22,0.5,'rgba(180,80,140,0.6)');
        caption('ты хочешь со мной — мне не верится',W,H,0.45);
      },
      (lp)=>{
        drawMoon(W*0.8,H*0.18,15,0.5);
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'cry',a:0.65,hairLong:-10});
        drawPhone(W*0.62,gy-50,1,0.6,0.8);
        caption('я знаю, как ты по ночам дома грустишь',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        bldg(W*0.6,H*0.18,W*0.3,gy,0.3,5);
        figure(W*0.36,gy-44,{s:0.95,a:0.65,face:'calm'});
        figure(W*0.48,gy-44,{s:0.95,fem:true,a:0.65,face:'calm',hairFlow:Math.sin(t*0.05)*3});
        drawBottle(W*0.42,gy-26,0.9,0.6,Math.sin(t*0.04)*0.2);
        caption('бутылка, падик, ты и я',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T20 — Урод
// школа, она отворачивается → мечта: популярность, $ → неон МОТЕЛЬ → один, пузырь-мечта, зеркало
function mirror(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[110,80,140];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // школьная доска
        ink(0.35,1.3); srect(W*0.08,H*0.16,W*0.3,H*0.2,1.2);
        figure(W*0.4,gy-46,{s:1,face:'sad',a:0.7});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'flat',a:0.6,flip:true,hairFlow:-3});
        caption('ты мне отказала, потому что я урод',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1,face:'happy',a:0.7});
        // подписчики/деньги
        if(t%12===0) parts.spawn({x:rnd(W*0.2,W*0.8),y:gy-rnd(20,70),vy:-rnd(0.4,1),life:90,type:'note',txt:(t%24===0?'$':'♥'),r:rnd(3,5),col:C});
        txt('1 000 000',W*0.5,H*0.24,Math.min(30,W*0.07),0.5,'rgba(110,80,140,0.6)');
        caption('я стану популярным в интернете',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // неон МОТЕЛЬ
        const fl=(Math.sin(t*0.3)>-0.3)?1:0.3;
        ink(0.5,1.4); srect(W*0.3,H*0.3,W*0.4,H*0.18,1.3);
        txt('МОТЕЛЬ',W*0.5,H*0.42,Math.min(34,W*0.08),0.7*fl,`rgba(200,74,106,${0.8*fl})`);
        caption('я сниму нам мотель где-то под вечер',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // один за столом, зеркало с отражением
        figure(W*0.36,gy-30,{s:0.95,a:0.65,face:'sad',sit:true});
        ink(0.4,1.4); srect(W*0.6,H*0.24,W*0.16,H*0.3,1.3);
        ctx.save(); ctx.globalAlpha=0.5; figure(W*0.68,gy-30,{s:0.8,a:0.6,face:'sad',flip:true}); ctx.restore();
        // пузырь-мечта
        ink(0.3,1); scir(W*0.5,H*0.22,W*0.08,1.5);
        if(t%30===0) parts.spawn({x:W*0.5,y:H*0.22,vy:-0.3,life:80,type:'heart',r:3,col:C});
        caption('я тощий додик и мечтаю…',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


function cigarette(){
  let t=0; _pg=-1;
  const parts=mkParts(240);
  const ashF=Array.from({length:16},()=>({x:rnd(0,1),y:rnd(0,1),v:rnd(0.0005,0.0013),ph:rnd(0,6.28),r:rnd(0.8,1.8)}));
  const hatch=Array.from({length:30},()=>({y:rnd(0.06,0.94),d:rnd(0,1),l:rnd(0.55,1)}));
  const bub=Array.from({length:5},(_,i)=>({d:i*0.16+rnd(0,0.05),dx:rnd(-0.06,0.06),s:rnd(0.85,1.3),w:i%2}));
  const rings=Array.from({length:7},(_,i)=>({d:i/7,dy:rnd(-0.05,0.05),k:i%4}));
  const towers=Array.from({length:7},(_,i)=>({x:0.03+i*0.135+rnd(-0.02,0.02),h:rnd(0.14,0.32),w:rnd(0.05,0.09),rows:2+(i%3)}));
  const stars=Array.from({length:22},()=>({x:rnd(0.05,0.95),y:rnd(0.03,0.38),tw:rnd(0,6.28)}));
  const waves=Array.from({length:6},()=>({ph:rnd(0,6.28),amp:rnd(0.6,1.1)}));
  let popped=-1, ashFell=0;
  function duo(w,a,rev){ // та самая пара: он-уёбок с вытаращенными глазами, она смеётся у плеча
    const s=w/190, aa=a*Math.max(0,Math.min(1,rev)); if(aa<=0.01)return;
    figure(-w*0.13,0,{s:s,a:aa,face:'happy',lean:0.05});
    ink(aa*0.9,1); scir(-w*0.13-4*s,-32*s,3*s,0.9); scir(-w*0.13+4*s,-32*s,2.3*s,0.9);
    figure(w*0.12,0,{s:s,a:aa,face:'happy',fem:true,flip:true,lean:-0.13,headTilt:0.18,hairFlow:2});
  }
  function polFrame(pw,a){ const ph2=pw*0.84;
    ctx.fillStyle=`rgba(252,250,243,${0.92*a})`; ctx.fillRect(-pw/2,-ph2/2,pw,ph2);
    ink(0.55*a,1.5); srect(-pw/2,-ph2/2,pw,ph2,1.3); return ph2; }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; const M=Math.min(W,H);
    ashF.forEach(d=>{ d.y-=d.v; if(d.y<-0.02)d.y=1.02; fink(0.1); ctx.beginPath(); ctx.arc(d.x*W+Math.sin(t*0.013+d.ph)*9,d.y*H,d.r,0,7); ctx.fill(); });

    // ── 1. полароид проявляется штриховкой, кольца дыма в бит ── 0–0.22
    act(p,0.0,0.22,(lp,a)=>{
      const rev=EZ.io(Math.min(1,lp*1.25)), pw=W*0.6;
      ctx.save(); ctx.translate(W*0.5,H*0.42); ctx.rotate(0.07);
      const ph2=polFrame(pw,1);
      const iw=pw*0.86, ih=ph2*0.7, iy=-ph2*0.06;
      ctx.fillStyle=`rgba(208,204,196,${0.75-rev*0.5})`; ctx.fillRect(-iw/2,iy-ih/2,iw,ih);
      ink(0.3,1); srect(-iw/2,iy-ih/2,iw,ih,1);
      hatch.forEach(h=>{ if(h.d>rev+AUD.beat*0.15)return; const hy=iy-ih/2+h.y*ih;
        ink(0.1+0.1*AUD.beat,0.7); sl(-iw/2+4,hy,-iw/2+4+(iw*h.l*rev-8),hy+ww(1.5),0.6); });
      ctx.save(); ctx.translate(0,iy+ih*0.28); duo(iw,0.9,rev); ctx.restore();
      if(lp>0.72){ const ha=(lp-0.72)/0.28; // общий нимб + сердечко дрожащей рукой
        red(0.4*ha,1.2); sellipse(0,iy-ih*0.14,iw*0.24*kick(0.08),ih*0.16,1.1);
        drawHeart(iw*0.36+ww(1.5),ph2*0.36+ww(1.5),M*0.013*ha,0.75*ha); }
      red(0.6,1.3); sl(0,-ph2/2-8,3,-ph2/2+6,1.2); ctx.restore(); // кривая булавка
      const cgl=M*0.12; // тлеющая сигарета внизу
      ink(0.6,1.3); srect(W*0.5-cgl/2,H*0.9-M*0.006,cgl,M*0.012,1.1);
      fink(0.4); ctx.fillRect(W*0.5-cgl/2,H*0.9-M*0.005,cgl*0.25,M*0.01);
      fred(0.45+AUD.beat*0.45); ctx.beginPath(); ctx.arc(W*0.5+cgl/2,H*0.9,M*0.006*kick(0.35),0,7); ctx.fill();
      rings.forEach((r,i)=>{ const fp=(lp*2.2+r.d)%1; const rr=(4+fp*26)*(1+AUD.beat*0.25);
        ink(0.25*(1-fp),1); sellipse(W*0.5+Math.sin(fp*5+i)*W*0.04,H*0.88-fp*H*0.5+r.dy*H,rr,rr*0.45,0.9); });
      caption('сигареты в спальной комнате',W,H,0.45*a);
    });

    // ── 2. обмен одеждой: олимпийка прыгает в бит, ТВ бубнит «ТУПЫЕ» ── 0.21–0.36
    act(p,0.21,0.36,(lp,a)=>{
      ground(W,H,H*0.78,0.2);
      ink(0.35,1.2); srect(W*0.06,H*0.3,W*0.16,H*0.46,1.1); sl(W*0.14,H*0.3,W*0.14,H*0.76,0.8); scir(W*0.12,H*0.52,2,0.8); // кривой шкаф
      const tvOff=lp>0.88?(lp-0.88)/0.12:0; // телевизор с антенной-рогаткой
      ink(0.4,1.2); srect(W*0.74,H*0.5,W*0.16,H*0.13,1.1); sl(W*0.78,H*0.63,W*0.78,H*0.76,1); sl(W*0.86,H*0.63,W*0.86,H*0.76,1);
      sl(W*0.8,H*0.5,W*0.76,H*0.42,0.9); sl(W*0.8,H*0.5,W*0.84,H*0.42,0.9);
      ctx.fillStyle=`rgba(225,222,210,${0.5*(1-tvOff)})`; ctx.fillRect(W*0.752,H*0.512,Math.max(1,W*0.136*(1-tvOff)),Math.max(1,H*0.106*(1-tvOff*0.9)));
      if(tvOff>0){ fink(0.7); ctx.beginPath(); ctx.arc(W*0.82,H*0.565,2.5*(1-tvOff)+0.5,0,7); ctx.fill(); } // гаснет в точку
      bub.forEach((b,i)=>{ const fp=lp*1.7-b.d; if(fp<0||fp>1||tvOff>0)return; // пузыри лопаются о потолок
        const bx=W*(0.8+b.dx), by=H*(0.48-fp*0.42);
        if(fp>0.95&&i>popped){ popped=i; for(let j=0;j<6;j++) parts.spawn({x:bx,y:by,vx:rnd(-1.5,1.5),vy:rnd(0.2,1.6),g:0.05,life:50,r:4,type:'note',txt:'ТУПЫЕ'[j%5],col:[26,22,18]}); }
        ink(0.4*(1-fp*0.3),1); sellipse(bx,by,M*(b.w?0.05:0.07)*b.s,M*0.03*b.s,1);
        txt(b.w?'ТУПЫЕ':'НИЧЕГО НЕ ВЫЙДЕТ',bx,by+3,M*(b.w?0.024:0.014),0.5*(1-fp*0.3)); });
      const spin=Math.sin(t*0.05), her=W*0.45, hy=H*0.55-AUD.beat*M*0.015; // она крутится в его олимпийке
      figure(her,hy,{s:1.15,fem:true,face:'happy',hairFlow:spin*6,headTilt:spin*0.1});
      ink(0.55,1.5); spath([[her-22,hy-14],[her-30+spin*8,hy+26],[her+30-spin*8,hy+26],[her+22,hy-14]],false,1.3);
      red(0.4+AUD.beat*0.5,1.2); sl(her-26+spin*6,hy+2,her-30+spin*8,hy+20,1.1); sl(her+26-spin*6,hy+2,her+30-spin*8,hy+20,1.1);
      const drown=lp>0.78?EZ.io((lp-0.78)/0.22):0; // куртка поверх — тонет до носа
      if(drown>0){ ink(0.5*drown,1.4); spath([[her-26,hy-32+drown*8],[her-29,hy+24],[her+29,hy+24],[her+26,hy-32+drown*8]],false,1.3); }
      figure(W*0.3,H*0.55,{s:1.1,face:'love',raiseR:drown,lean:0.04,ph:Math.sin(t*0.04)}); // он в майке, рад
      if(lp>0.3&&lp<0.7){ ink(0.6,1.2); sl(W*0.33,H*0.5,W*0.4,H*0.46,1.1); sl(W*0.4,H*0.46,W*0.4,H*0.43,1.3); } // палец телевизору
      caption('ты в моей куртке, я норм',W,H,0.45*a);
    });

    // ── 3. клёво в ванной: пар, кораблик, «КЛЁВО» на зеркале ── 0.34–0.50
    act(p,0.34,0.50,(lp,a)=>{
      const bx=W*0.5, by=H*0.72, R=M*0.21;
      const sw=Math.sin(t*0.06)*(0.12+AUD.beat*0.3); // лампочка качается в бит
      ink(0.4,1); sl(W*0.5,0,W*0.5+sw*M*0.5,H*0.15,1);
      ctx.fillStyle=`rgba(235,200,110,${0.45+AUD.beat*0.35})`; ctx.beginPath(); ctx.arc(W*0.5+sw*M*0.5,H*0.16,M*0.013,0,7); ctx.fill();
      ink(0.35,1.1); sellipse(W*0.17,H*0.3,M*0.085,M*0.105,1.1); fink(0.04); ctx.beginPath(); ctx.ellipse(W*0.17,H*0.3,M*0.075,M*0.095,0,0,7); ctx.fill();
      writeOn('КЛЁВО',W*0.17,H*0.3,M*0.034,Math.max(0,lp*2.2-0.4),0.55); // пальцем по запотевшему
      if(lp>0.55) drawHeart(W*0.17,H*0.36,M*0.013,Math.min(0.6,(lp-0.55)*3));
      ink(0.55,1.6); sarc(bx,by-M*0.03,R,0.12,Math.PI-0.12,1.5); sl(bx-R,by-M*0.03,bx+R,by-M*0.03,1.6); // чугунная ванна
      ink(0.45,1.2); sl(bx-R*0.7,by+R*0.42,bx-R*0.78,by+R*0.6,1.2); sarc(bx-R*0.78,by+R*0.62,M*0.01,0,Math.PI,1); // львиные лапы
      sl(bx+R*0.7,by+R*0.42,bx+R*0.78,by+R*0.6,1.2); sarc(bx+R*0.78,by+R*0.62,M*0.01,0,Math.PI,1);
      ink(0.3,0.9); for(let i=-3;i<=3;i++) sarc(bx+i*R*0.26,by-M*0.035,R*0.12,Math.PI,Math.PI*2,0.8); // пена
      ink(0.5,1.1); for(let i=0;i<4;i++) sarc(bx+(i-1.5)*R*0.3,by-M*0.03,M*0.015,Math.PI,Math.PI*2,1); // четыре коленки
      const near=EZ.io(Math.max(0,(lp-0.6)/0.4))*R*0.22; // головы сближаются, лбы соприкасаются
      const hx1=bx-R*0.55+near, hx2=bx+R*0.55-near, hy=by-M*0.075;
      ink(0.7,1.3); scir(hx1,hy,M*0.028,1.2); drawFace(hx1+M*0.008,hy,lp>0.8?'calm':'happy',0.7);
      scir(hx2,hy,M*0.028,1.2); ink(0.55,0.9); for(let i=-3;i<=3;i++) sl(hx2+i*2,hy-M*0.034,hx2+i*3,hy+M*0.01,0.8);
      drawFace(hx2-M*0.008,hy,lp>0.8?'calm':'happy',0.7);
      const bp=EZ.io(Math.min(1,lp*2)), btx=hx1+(hx2-hx1)*bp, sink=lp>0.5?Math.min(1,(lp-0.5)*4):0; // кораблик из пачки
      if(sink<1){ const sy2=by-M*0.045+sink*M*0.025;
        ink(0.6*(1-sink),1.1); spath([[btx-M*0.016,sy2],[btx+M*0.016,sy2],[btx+M*0.008,sy2-M*0.015],[btx-M*0.008,sy2-M*0.015]],true,1);
        if(sink>0&&t%6===0) parts.spawn({x:btx,y:sy2,vx:rnd(-1.2,1.2),vy:rnd(-2,-0.6),g:0.1,life:26,r:rnd(1.5,2.5),type:'drop',col:[90,110,140]}); }
      ink(0.16,0.9); for(let i=0;i<6;i++){ const sy=by-M*0.05-((t*0.7+i*34)%(H*0.5)); sarc(bx+Math.sin(sy*0.02+i*2)*R*0.5,sy,M*0.018+i,0.3,2.8,0.8); } // спирали пара
      if(AUD.beat>0.75&&t%7===0) parts.spawn({x:bx+rnd(-R*0.6,R*0.6),y:by-M*0.06,vx:rnd(-0.3,0.3),vy:rnd(-1.4,-0.7),g:-0.004,life:70,r:rnd(4,9),type:'smoke',col:[120,116,108]});
      ctx.fillStyle=`rgba(242,237,230,${(0.2+lp*0.45)*0.6})`; ctx.fillRect(0,0,W,H*0.55); // пар заполняет кадр
      if(lp>0.8){ red(0.5*(lp-0.8)*5,1.3); sellipse(bx,hy-M*0.065,R*0.45*kick(0.12),M*0.02,1.1); } // общий нимб-неон
      caption('без одежды в ванной',W,H,0.45*a);
    });

    // ── 4. кольца дыма становятся воспоминаниями ── 0.48–0.57
    act(p,0.48,0.57,(lp,a)=>{
      ctx.fillStyle='rgba(26,22,18,0.12)'; ctx.fillRect(0,0,W,H);
      windowFrame(W*0.42,H*0.18,W*0.16,H*0.2,0.4); // окно: город мигает в ритм
      for(let i=0;i<8;i++){ const lit=Math.sin(i*9.1+Math.floor(t/25))>0.2?1:0.25;
        ctx.fillStyle=`rgba(220,190,120,${0.4*lit*(0.5+AUD.beat*0.5)})`; ctx.fillRect(W*(0.44+(i%4)*0.032),H*(0.23+Math.floor(i/4)*0.07),3,4); }
      ink(0.45,1.3); srect(W*0.6,H*0.66,W*0.32,H*0.12,1.2); // матрас, двое валетом
      ink(0.5,1.2); for(let i=0;i<7;i++){ const px=W*(0.62+i*0.04); sl(px,H*0.64+Math.sin(i*2.3)*3,px+W*0.02,H*0.66,1); } // плед-каракуля
      ink(0.7,1.3); scir(W*0.65,H*0.62,M*0.022,1.1); drawFace(W*0.65,H*0.62,'calm',0.7);
      scir(W*0.87,H*0.62,M*0.022,1.1); drawFace(W*0.87,H*0.62,'calm',0.7);
      ink(0.5,0.9); for(let i=-3;i<=3;i++) sl(W*0.87+i*2,H*0.62-M*0.028,W*0.87+i*2.6,H*0.59,0.7);
      ink(0.45,1.2); srect(W*0.12,H*0.7,W*0.09,H*0.08,1.1); sellipse(W*0.165,H*0.69,M*0.028,M*0.01,1.1); // ящик и пепельница
      for(let i=0;i<4;i++) sl(W*(0.15+i*0.012),H*0.685,W*(0.152+i*0.012),H*0.672,1); // окурки-палочки
      ink(0.2,0.9); for(let i=0;i<3;i++){ const sy=H*0.66-((t*0.5+i*30)%(H*0.3)); sarc(W*0.165+Math.sin(sy*0.03+i)*6,sy,4,0.4,2.7,0.7); }
      rings.forEach(r=>{ const fp=(lp*1.6+r.d)%1; const rx=W*(0.62-fp*0.5), ry=H*(0.56+r.dy)-fp*H*0.18; // кольца справа налево, пульс в бит
        const rr=(M*0.012+fp*M*0.03)*(1+AUD.beat*0.3), al=0.5*(1-fp*0.7);
        if(fp<0.45){ ink(al,1.1); sellipse(rx,ry,rr,rr*0.55,1); }
        else if(r.k===0) drawHeart(rx,ry,rr*0.7,al);
        else if(r.k===1){ ink(al,1); srect(rx-rr*0.6,ry-rr*0.6,rr*1.2,rr*1.2,0.9); fink(al*0.3); ctx.fillRect(rx-rr*0.4,ry-rr*0.45,rr*0.8,rr*0.6); } // колечко-полароид
        else if(r.k===2){ ink(al,1); spath([[rx-rr*0.6,ry+rr*0.5],[rx-rr*0.3,ry-rr*0.5],[rx+rr*0.3,ry-rr*0.5],[rx+rr*0.6,ry+rr*0.5]],false,0.9); } // колечко-олимпийка
        else { ink(al,1); sarc(rx,ry,rr*0.6,0.2,Math.PI-0.2,0.9); sl(rx-rr*0.6,ry,rx+rr*0.6,ry,0.9); } }); // колечко-ванна
      if(lp>0.45&&lp<0.78){ const ca=1-Math.abs((lp-0.45)/0.33*2-1); // «обручальное» кольцо тает
        ink(0.6*ca,1.1); sl(W*0.84,H*0.61,W*0.8,H*0.55,1.1); red(0.6*ca,1.2); scir(W*0.8,H*0.545,M*0.007,1); }
      ctx.fillStyle=`rgba(26,22,18,${0.05+lp*0.06})`; ctx.fillRect(0,0,W,H*0.16); // слоистый дым на потолке
      if(lp>0.7){ const pa=(lp-0.7)*1.3; ink(pa,1.1); // два профиля друг к другу
        spath([[W*0.42,H*0.11],[W*0.45,H*0.06],[W*0.465,H*0.085],[W*0.47,H*0.12]],false,1);
        spath([[W*0.58,H*0.11],[W*0.55,H*0.06],[W*0.535,H*0.085],[W*0.53,H*0.12]],false,1); }
      caption('сигареты в спальной комнате',W,H,0.45*a);
    });

    // ── 5. балкон: вспышка полароида, «НЕХУЁВО» из звёзд ── 0.55–0.71
    act(p,0.55,0.71,(lp,a)=>{
      stars.forEach(s=>{ fink(0.2+0.3*(Math.sin(t*0.05+s.tw)*0.5+0.5)); ctx.beginPath(); ctx.arc(s.x*W,s.y*H,1.1,0,7); ctx.fill(); });
      const plx=W*(0.05+lp*0.85); // самолётик-каракуля
      ink(0.4,1); sl(plx-M*0.018,H*0.1,plx+M*0.018,H*0.1,1.1); sl(plx,H*0.1,plx-M*0.008,H*0.085,0.9); sl(plx,H*0.1,plx-M*0.008,H*0.115,0.9);
      if(Math.floor(t/12)%2){ fred(0.7); ctx.beginPath(); ctx.arc(plx+M*0.02,H*0.1,1.5,0,7); ctx.fill(); }
      towers.forEach(b=>bldg(W*b.x,H*(0.7-b.h),W*b.w,H*0.7,0.35,b.rows)); // панорама города
      ink(0.4,1); sl(W*0.84,H*0.7,W*0.86,H*0.34,1); sl(W*0.88,H*0.7,W*0.86,H*0.34,1); sl(W*0.845,H*0.58,W*0.875,H*0.58,0.8); // телевышка
      fred(0.4+AUD.beat*0.5); ctx.beginPath(); ctx.arc(W*0.86,H*0.33,3*kick(0.4),0,7); ctx.fill(); // огонёк-сердце
      ink(0.5,1.4); sl(0,H*0.7,W,H*0.7,1.6); for(let i=0;i<15;i++) sl(W*(i/15+0.03),H*0.7,W*(i/15+0.03),H*0.95,1); // перила
      const hug=lp>0.78?EZ.io((lp-0.78)/0.22):0;
      figure(W*(0.18+hug*0.07),H*0.62,{s:1.1,face:lp<0.42?'shock':(lp<0.5?'flat':'happy'),raiseR:0.9*(1-hug),lean:0.05+Math.sin(t*0.03)*0.03});
      figure(W*0.3,H*0.62,{s:1.05,fem:true,face:'happy',flip:true,hairFlow:Math.sin(t*0.05)*4,headTilt:-0.15,lean:-Math.sin(t*0.03)*0.03});
      if(hug<0.5){ ink(0.6,1.3); srect(W*0.265,H*0.5,M*0.026,M*0.018,1.1); } // полароид на вытянутой руке
      if(lp>0.3&&lp<0.38) flash(0.55*(1-(lp-0.3)/0.08),`rgba(255,253,245,${0.55*(1-(lp-0.3)/0.08)})`); // белая вспышка
      if(lp>0.36){ const grab=lp>0.5, out=EZ.out(Math.min(1,(lp-0.36)/0.1)); // снимок выползает, она прижимает к груди
        ctx.save(); ctx.translate(grab?W*0.305:W*0.285,grab?H*0.6:H*0.5+out*M*0.025); ctx.rotate(grab?-0.2:0.1); polFrame(M*0.05,0.9); ctx.restore(); }
      const cl=Math.sin(t*0.08)*0.2; // чокаются, пьяно покачиваясь
      drawBottle(W*0.22,H*0.6,0.8,0.6,0.5+cl); drawBottle(W*0.255,H*0.6,0.8,0.6,-0.5-cl);
      if(AUD.beat>0.8&&t%6===0) for(let j=0;j<3;j++) parts.spawn({x:W*0.24,y:H*0.55,vx:rnd(-1,1),vy:rnd(-2,-0.8),g:0.04,life:34,r:rnd(2,3.5),type:'star',col:[200,170,90]});
      if(lp>0.78){ const fa=(lp-0.78)/0.22; // надпись из звёзд + падающая звезда зачёркивает
        writeOn('Н Е Х У Ё В О',W*0.6,H*0.2,M*0.05,fa,0.5,'rgba(230,210,150,0.6)');
        if(fa>0.6){ const sx=W*(0.42+(fa-0.6)*0.9); red(0.5,1.4); sl(W*0.42,H*0.16,sx,H*0.16+(sx-W*0.42)*0.1,1.3); star5(sx,H*0.16+(sx-W*0.42)*0.1,4,0.7); } }
      caption('я рад быть с тобою в хлам',W,H,0.45*a);
    });

    // ── 6. утонуть в её волосах: испуг → блаженство → палец вверх ── 0.69–0.83
    act(p,0.69,0.83,(lp,a)=>{
      const cover=EZ.io(Math.min(1,lp*1.5)), gfa=Math.min(0.45,lp*1.1);
      ink(gfa,1.6); sarc(W*0.62,H*0.02,M*0.3,0.3,Math.PI-0.3,1.5); // её гигантское лицо сверху
      ctx.save(); ctx.translate(W*0.62,H*0.1); ctx.scale(M*0.005,M*0.005); drawFace(0,0,'calm',gfa); ctx.restore();
      for(let i=0;i<6;i++){ const wv=waves[i], yy=H*0.1+H*(0.12+i*0.13)*cover; // чернильные волны-локоны
        fink(0.07+i*0.013); ctx.beginPath(); ctx.moveTo(W*1.05,yy-H*0.18);
        for(let x=20;x>=0;x--) ctx.lineTo(W*1.05-x*W*0.055,yy+Math.sin(x*0.7+t*0.025+wv.ph)*H*0.025*wv.amp*(1+AUD.beat*0.3));
        ctx.lineTo(W*1.05,H*1.1); ctx.closePath(); ctx.fill();
        const cx2=W*(0.15+i*0.14), cy2=yy+Math.sin(i*2+t*0.025)*H*0.02; // спирали гребней + красные блики на бит
        ink(0.25,1); sarc(cx2,cy2,M*0.014,t*0.03+i,t*0.03+i+4.5,0.9);
        if(AUD.beat>0.6){ red(0.4*AUD.beat,1.1); sl(cx2-M*0.02,cy2,cx2+M*0.02,cy2+ww(2),1); } }
      const calm=EZ.io(Math.max(0,(lp-0.3)/0.35)), sinkY=lp>0.78?EZ.in((lp-0.78)/0.22)*H*0.12:0;
      const fy=H*0.55+Math.sin(t*0.04)*H*0.02+sinkY;
      ctx.save(); ctx.translate(W*0.42,fy); ctx.rotate(-1.45*calm); // по-собачьи → на спине
      figure(0,0,{s:Math.max(0.55,H*0.0013),a:Math.max(0,0.8-sinkY/(H*0.1)),face:calm>0.55?'calm':(calm>0.1?'happy':'shock'),raise:calm*0.9,ph:t*0.15*(1-calm),swing:(1-calm)*6});
      ctx.restore();
      if(lp>0.85){ const th=(lp-0.85)/0.15; // рука с большим пальцем + красный нимб на волнах
        ink(0.7*th,1.5); sl(W*0.42,fy-sinkY-H*0.01,W*0.42,fy-sinkY-H*0.06,1.4); sl(W*0.42,fy-sinkY-H*0.06,W*0.426,fy-sinkY-H*0.085,1.3); sl(W*0.413,fy-sinkY-H*0.058,W*0.428,fy-sinkY-H*0.056,1.2);
        red(0.5*th,1.2); scir(W*0.47,fy-sinkY-H*0.03+Math.sin(t*0.05)*4,M*0.012*kick(0.15),1.1); }
      const bob=Math.sin(t*0.05)*5; // предметы их ночи на волнах
      ctx.save(); ctx.translate(W*0.64,H*0.62+bob); ctx.rotate(0.15); polFrame(M*0.045,0.7); duo(M*0.036,0.6,1); ctx.restore();
      ink(0.5,1.1); spath([[W*0.25-M*0.014,H*0.68-bob],[W*0.25+M*0.014,H*0.68-bob],[W*0.25+M*0.007,H*0.68-bob-M*0.013],[W*0.25-M*0.007,H*0.68-bob-M*0.013]],true,1); // кораблик
      sl(W*0.25,H*0.68-bob-M*0.013,W*0.25,H*0.68-bob-M*0.035,1.1); fred(0.5); ctx.beginPath(); ctx.arc(W*0.25,H*0.68-bob-M*0.037,1.6,0,7); ctx.fill(); // сигарета-мачта
      caption('твои волосы в моём плену',W,H,0.45*a);
    });

    // ── 7. догорающая сигарета сплетает дым в то самое фото ── 0.81–1.0
    act(p,0.81,1.0,(lp,a)=>{
      const dawn=EZ.io(lp);
      ctx.fillStyle=`rgba(26,22,18,${0.18*(1-dawn*0.6)})`; ctx.fillRect(0,0,W,H);
      windowFrame(W*0.1,H*0.16,W*0.2,H*0.34,0.45); // окно светлеет к рассвету
      ctx.fillStyle=`rgba(${200+dawn*40},${150+dawn*45},${150+dawn*35},${0.08+dawn*0.22})`; ctx.fillRect(W*0.102,H*0.162,W*0.196,H*0.336);
      ink(0.14*(1-dawn),0.7); for(let i=0;i<5;i++) sl(W*0.11,H*(0.2+i*0.06),W*0.29,H*(0.2+i*0.06)+ww(2),0.6); // редеющая штриховка неба
      const br=Math.sin(t*0.018)*M*0.006; // дыхание вдвое реже бита
      ink(0.45,1.3); srect(W*0.4,H*0.72,W*0.34,H*0.1,1.2);
      ink(0.55,1.4); spath([[W*0.42,H*0.72],[W*0.5,H*0.69-br],[W*0.6,H*0.7-br],[W*0.7,H*0.72]],false,1.3); // плед
      scir(W*0.44,H*0.7,M*0.018,1.1); scir(W*0.68,H*0.7,M*0.018,1.1); // два спящих силуэта
      const cgx=W*0.82, cgy=H*0.78, cl2=M*0.13, burn=Math.min(1,lp*1.15), fall=lp>0.86;
      ink(0.5,1.2); sellipse(cgx,cgy+M*0.01,M*0.045,M*0.014,1.2); // пепельница
      ctx.save(); ctx.translate(cgx,cgy); ctx.rotate(-1.35+ww(0.012)*AUD.beat*4); // сигарета вздрагивает на доли
      ink(0.6,1.3); srect(0,-M*0.005,cl2*(1-burn*0.55),M*0.01,1.1);
      if(!fall){ fink(0.5); ctx.fillRect(cl2*(1-burn*0.55),-M*0.004,cl2*burn*0.3,M*0.008); } // столбик пепла растёт
      fred(fall?0.08:(0.45+AUD.beat*0.45)); ctx.beginPath(); ctx.arc(cl2*(1-burn*0.55)+(fall?0:cl2*burn*0.3),0,M*0.006*kick(0.3),0,7); ctx.fill();
      ctx.restore();
      if(fall&&!ashFell){ ashFell=1; for(let j=0;j<8;j++) parts.spawn({x:cgx+rnd(-4,4),y:cgy-cl2*0.5,vx:rnd(-0.5,0.5),vy:rnd(0.5,1.5),g:0.06,life:40,r:rnd(1,2.2),type:'dot',col:[120,116,108]}); } // пепел падает
      if(!fall){ ink(0.3,1); ctx.beginPath(); ctx.moveTo(cgx-M*0.02,cgy-cl2*0.55); // дым одной линией вверх
        for(let i=0;i<=16;i++){ const k2=i/16; ctx.lineTo(cgx-M*0.02-(cgx-W*0.6)*k2+Math.sin(i*0.8+t*0.02)*M*0.014*(1.1-k2),cgy-cl2*0.55-(cgy-cl2*0.55-H*0.33)*k2); }
        ctx.stroke(); }
      const pho=Math.min(1,Math.max(0,(lp-0.22)/0.45))*(fall?Math.max(0,1-(lp-0.86)/0.09):1);
      const rf=fall&&lp<0.92?Math.max(0,1-(lp-0.86)/0.06):0; // полароидная вспышка красным контуром
      if(pho>0.02){ ctx.save(); ctx.translate(W*0.6,H*0.25); ctx.rotate(0.06);
        if(rf>0) red(0.8*rf,1.6); else ink(0.35*pho,1.2);
        const pw2=M*0.16, ph3=pw2*0.84; srect(-pw2/2,-ph3/2,pw2,ph3,1.2); srect(-pw2*0.43,-ph3*0.42,pw2*0.86,ph3*0.6,0.9);
        duo(pw2*0.7,0.5*pho+rf*0.4,1); ctx.restore();
        if(rf>0.5) flash(0.12*rf); }
      if(lp>0.72){ const wa=(lp-0.72)/0.28; // реальный полароид на стене покачивается
        ctx.save(); ctx.translate(W*0.35,H*0.32); ctx.rotate(0.07+Math.sin(t*0.02)*0.05);
        polFrame(M*0.07,wa*0.9); duo(M*0.052,wa*0.8,1); red(0.5*wa,1.1); sl(0,-M*0.034,2,-M*0.026,1); ctx.restore(); }
      if(lp>0.93){ ctx.fillStyle=`rgba(10,8,6,${(lp-0.93)/0.07*0.75})`; ctx.fillRect(0,0,W,H); } // затемнение
      caption('мы выглядим так клёво',W,H,0.45*a*Math.max(0,1-Math.max(0,(lp-0.88)/0.12)));
    });

    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  }
  f();
}


// T22 — Неудобно
// она намекает → неудобные места (площадка, примерочная) → волосы на кулак → идеи кончились
function awkward(){
  let t=0; _pg=-1;
  const parts=mkParts(50);
  const C=[190,120,130];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'flat',a:0.7});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'calm',a:0.72,hairFlow:Math.sin(t*0.05)*4});
        ink(0.35,1.2); scir(W*0.7,H*0.3,W*0.06,1.4); txt('…',W*0.7,H*0.31,18,0.4);
        caption('ты мне намекала, что нам станет скучно',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // площадка
        drawSwing(W*0.24,H*0.34,H*0.28,Math.sin(t*0.04)*0.1,0.4);
        // примерочная — шторка
        ink(0.45,1.3); sl(W*0.55,H*0.2,W*0.8,H*0.2,1.3);
        for(let i=0;i<6;i++) sl(W*0.56+i*0.04*W,H*0.2,W*0.56+i*0.04*W,gy-20,1);
        figure(W*0.45,gy-44,{s:0.85,a:0.55,face:'flat'});
        caption('на детской площадке, в примерочной…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.42,gy-46,{s:1,face:'flat',a:0.68,raiseR:0.4});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'shock',a:0.68,headTilt:0.2,hairLong:-14,hairFlow:6});
        // волосы намотаны на кулак
        ink(0.5,1.2); for(let i=0;i<4;i++) sarc(W*0.5,gy-50,6+i*2,0,Math.PI*1.6,1);
        caption('накрутить на кулак твои волосы',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'flat',a:0.6});
        figure(W*0.6,gy-46,{s:1,fem:true,face:'sad',a:0.6});
        // пустой пузырь мысли
        ink(0.35,1.2); scir(W*0.5,H*0.26,W*0.1,1.5);
        txt('?',W*0.5,H*0.28,W*0.06,0.4);
        caption('закончились идеи, закончились идеи',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T23 — Тетрадь
// девушки игнорят, нет ответа → тетрадь, буквы в слово → тёмные мысли → плачет, как туго мне
function journal(){
  let t=0; _pg=-1;
  const parts=mkParts(50);
  const C=[60,80,140];
  const word='ШАЛАВА';
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'sad',a:0.7});
        // очки
        ink(0.5,1.2); scir(W*0.4-4,gy-48,3,1); scir(W*0.4+4,gy-48,3,1);
        figure(W*0.66,gy-44,{s:0.9,fem:true,face:'flat',a:0.5,flip:true});
        drawPhone(W*0.5,gy-40,1,0.5,0);
        caption('глупые девочки не замечают меня',W,H,0.45);
      },
      (lp)=>{
        // тетрадь
        ink(0.2,0.7); for(let i=1;i<9;i++) sl(W*0.2,H*0.14+i*H*0.075,W*0.8,H*0.14+i*H*0.075,0.5);
        red(0.3,1); sl(W*0.27,H*0.1,W*0.27,gy,1);
        writeOn(word,W*0.5,H*0.46,Math.min(46,W*0.1),lp,0.6,'rgba(60,80,140,0.6)');
        caption('я заведу тетрадь, буквы в слово',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const g=ctx.createRadialGradient(W*0.5,H*0.45,4,W*0.5,H*0.45,W*0.4);
        g.addColorStop(0,'rgba(60,80,140,0.12)'); g.addColorStop(1,'rgba(16,14,26,0.35)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        figure(W*0.4,gy-46,{s:1,face:'angry',a:0.65});
        drawKnife(W*0.62,gy-40,0.9,Math.sin(t*0.05)*0.2-0.3,0.5);
        caption('я надеюсь, тебя не найдут…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1,face:'cry',a:0.7});
        if(t%24===0) parts.spawn({x:W*0.5+rnd(-6,6),y:gy-44,vy:rnd(0.8,1.6),life:50,type:'drop',r:2,col:[60,90,170]});
        caption('если бы ты знала, как туго мне бывает',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T24 — Ванна, красный пол
// ванна, красный пол, бинты (забота) → велосипед вдвоём → цветы и кот (не одна) → мир тонет в слезах, чудо
function bath(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const C=[190,50,60];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        // красный пол
        ctx.fillStyle='rgba(190,50,60,0.16)'; ctx.fillRect(0,gy,W,H-gy);
        ink(0.5,1.4); sellipse(W*0.5,gy-12,W*0.18,20,1.5);
        figure(W*0.4,gy-44,{s:0.9,a:0.65,face:'calm'});
        figure(W*0.58,gy-44,{s:0.9,fem:true,a:0.65,face:'sad',hairLong:-8});
        // бинты на руках
        ink(0.6,1.2); for(let i=0;i<3;i++) sl(W*0.5,gy-30+i*4,W*0.56,gy-30+i*4,1);
        caption('перемотаю твои руки, всё будет круто',W,H,0.45);
      },
      (lp)=>{
        ink(0.4,1.2); sl(0,gy,W,gy,1.4);
        const bx=W*0.2+lp*W*0.55;
        drawBike(bx,gy-14,1,0.7,t*0.25);
        figure(bx-2,gy-44,{s:0.7,a:0.7,face:'happy',ph:t*0.25,raiseR:0.3});
        figure(bx+12,gy-40,{s:0.6,fem:true,a:0.6,face:'happy',hairFlow:6});
        caption('мы разгонимся на велике, как гоночный болид',W,H,0.45);
      },
      (lp)=>{
        ink(0.4,1.2); sl(0,gy,W,gy,1.4);
        figure(W*0.4,gy-46,{s:1,face:'happy',a:0.7,raiseR:0.5});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'happy',a:0.72,hairFlow:Math.sin(t*0.05)*3});
        drawFlower(W*0.5,gy-30,1,0.8,Math.sin(t*0.06)*3);
        drawCat(W*0.7,gy-6,0.9,0.6,Math.sin(t*0.08)*0.4);
        if(t%26===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy-60,vy:-rnd(0.3,0.7),life:90,type:'heart',r:4,col:C});
        caption('ты никогда не будешь одна',W,H,0.45);
      },
      (lp)=>{
        // мир тонет в слезах
        const wl=gy-EZ.io(lp)*H*0.45;
        figure(W*0.4,wl-44,{s:0.9,a:0.6,face:'calm'});
        figure(W*0.58,wl-44,{s:0.9,fem:true,a:0.6,face:'calm',hairFlow:4});
        ctx.fillStyle='rgba(60,90,170,0.2)'; ctx.fillRect(0,wl,W,H-wl);
        ink(0.4,1); for(let i=0;i<3;i++){const yy=wl+i*14; sl(0,yy+Math.sin(t*0.05+i)*4,W,yy+Math.cos(t*0.05+i)*4,1);}
        ctx.globalAlpha=0.5+0.2*EZ.pulse((t%150)/150);
        txt('ты моё чудо',W*0.5,H*0.26,Math.min(28,W*0.065),0.7,'rgba(190,50,60,0.7)');
        ctx.globalAlpha=1;
        caption('пусть этот мир утонет завтра, как ванна',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T25 — Все мои поступки
// посмотри в глаза (пустота) → обоссал подъезд, злые сообщения → петарды в спальне → конченые, глитч
function chaos(){
  let t=0; _pg=-1;
  const parts=mkParts(150);
  const C=[140,30,30];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        // огромное лицо, пустые глаза
        ink(0.5,1.6); scir(W*0.5,H*0.42,W*0.22,2.2);
        const ey=H*0.4;
        ink(0.6,1.6); scir(W*0.42,ey,W*0.04,1.6); scir(W*0.58,ey,W*0.04,1.6);
        // пустота внутри — воронка
        const g=ctx.createRadialGradient(W*0.42,ey,1,W*0.42,ey,W*0.04); g.addColorStop(0,'rgba(16,10,10,0.6)'); g.addColorStop(1,'rgba(16,10,10,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W*0.42,ey,W*0.04,0,7); ctx.fill();
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W*0.58,ey,W*0.04,0,7); ctx.fill();
        caption('посмотри в мои глаза — ничего никогда',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // подъезд
        ink(0.4,1.3); srect(W*0.3,H*0.2,W*0.4,gy-H*0.2,1.2);
        figure(W*0.5,gy-46,{s:0.95,face:'angry',a:0.65});
        if(t%14===0) parts.spawn({x:W*0.5,y:gy-20,vy:rnd(0.8,1.6),vx:rnd(-0.3,0.3),life:40,type:'drop',r:2,col:[150,120,40]});
        caption('я в который раз обоссал подъезд',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.4,1.3); srect(W*0.2,H*0.2,W*0.6,gy-H*0.2,1.2); // спальня
        figure(W*0.5,gy-44,{s:0.9,a:0.6,face:'angry'});
        // петарды
        if(t%5===0) for(let i=0;i<3;i++) parts.spawn({x:rnd(W*0.25,W*0.75),y:rnd(H*0.3,gy-20),vx:rnd(-4,4),vy:rnd(-4,4),life:30,type:'shard',r:rnd(2,5),col:C});
        if(AUD.beat>0.4) camShake(3);
        caption('взрывая петарды в нашей уютной спальне',W,H,0.5);
      },
      (lp)=>{
        // глитч-хаос
        for(let i=0;i<6;i++){ const yy=rnd(0,H); ctx.fillStyle=`rgba(${rnd(120,200)|0},30,30,0.12)`; ctx.fillRect(0,yy,W,rnd(2,10)); }
        ctx.globalAlpha=0.6+0.3*EZ.pulse((t%20)/20);
        txt('все мои поступки',W*0.5,H*0.4,Math.min(34,W*0.08),0.7,'rgba(140,30,30,0.7)');
        txt('конченые',W*0.5+ww(4),H*0.52,Math.min(40,W*0.09),0.7,'rgba(140,30,30,0.75)');
        ctx.globalAlpha=1;
        if(t%6===0) parts.spawn({x:rnd(0,W),y:rnd(0,H),vx:rnd(-3,3),vy:rnd(-3,3),life:24,type:'dot',r:rnd(1,3),col:C});
        caption('все мои поступки — конченые',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.22); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


// T26 — Прыгай, дура! (финал)
// клуб, алкоголь, Aperol → прыгай, дура (прыжок) → бывший-опер следит → большой прыжок, конфетти
function jump(){
  let t=0; _pg=-1;
  const parts=mkParts(180);
  const C=[230,120,40];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // клуб: огни по биту
        for(let i=0;i<6;i++){ const x=W*(0.1+i*0.16); const on=Math.sin(t*0.2+i)>0; ctx.fillStyle=`rgba(230,120,40,${on?0.18:0.05})`; ctx.fillRect(x-8,H*0.12,16,10); }
        figure(W*0.42,gy-44,{s:0.95,a:0.7,face:'happy',ph:t*0.15});
        figure(W*0.58,gy-44,{s:0.95,fem:true,a:0.7,face:'happy',ph:t*0.15+1,hairFlow:6});
        drawBottle(W*0.5,gy-26,0.9,0.6,Math.sin(t*0.06)*0.3);
        caption('во мне алкоголь, все раны лечит Aperol',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // прыжок по биту
        const j=Math.abs(Math.sin(t*0.18))*40*(1+AUD.beat);
        figure(W*0.5,gy-44-j,{s:1,fem:true,face:'happy',a:0.78,raise:0.8,hairFlow:8,step:4});
        if(t%8===0) parts.spawn({x:W*0.5+rnd(-30,30),y:gy,vy:-rnd(1,2),life:40,type:'dot',r:2,col:C});
        caption('на тебе мини-юбка, прыгай, дура',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-44,{s:0.95,fem:true,a:0.7,face:'shock',hairFlow:4});
        // бывший-опер следит
        figure(W*0.7,gy-50,{s:1.1,a:0.55,face:'angry'});
        ink(0.5,1.3); scir(W*0.7-4,gy-52,3,1); scir(W*0.7+4,gy-52,3,1); // взгляд
        if(t%30<15) txt('за нами наблюдают',W*0.5,H*0.26,Math.min(20,W*0.045),0.5,'rgba(140,40,40,0.55)');
        caption('твой бывший настроен, будто бы он опер',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // большой финальный прыжок + конфетти
        const j=EZ.bounce((t%50)/50)*70;
        figure(W*0.5,gy-44-j,{s:1.05,fem:true,face:'happy',a:0.82,raise:0.9,hairFlow:10,step:5});
        if(t%3===0) for(let i=0;i<3;i++) parts.spawn({x:rnd(0,W),y:-5,vy:rnd(1,3),vx:rnd(-1,1),vr:rnd(-0.2,0.2),rot:rnd(0,6),life:120,type:(i%2?'star':'petal'),r:rnd(3,6),col:[rnd(180,240)|0,rnd(80,160)|0,rnd(40,120)|0]});
        caption('прыгай со мною, дура, до утра',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.14); grain();
    rafId=requestAnimationFrame(f);
  } f();
}


window.__STORY_V3 = true;
