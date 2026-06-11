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
