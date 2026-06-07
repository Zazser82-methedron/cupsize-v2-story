// story-anim.js v2 — насыщенные, плавные, аудио-синхронные сюжетные анимации (60fps)
// Прогресс берётся из реального времени трека (howl.seek/duration) → плавно, без скачков.
// Линии «дышат» на ~12fps (boil), но движение интерполируется на 60fps.

// ─── Тайминг / прогресс ───────────────────────────────────────────────────────
let _frame = 0, _sk = 0, _pg = -1;
function bg(W,H){ ctx.clearRect(0,0,W,H); ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H); _sk=0; _frame++; }
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
  bounce:t=>Math.abs(Math.sin(t*Math.PI)), pulse:t=>0.5-0.5*Math.cos(t*Math.PI*2) };
function T(){ return _frame; }

// ─── Цвет / перо ──────────────────────────────────────────────────────────────
function ink(a,wd){ ctx.strokeStyle=`rgba(26,22,18,${a})`; if(wd!=null)ctx.lineWidth=wd; }
function red(a,wd){ ctx.strokeStyle=`rgba(200,40,26,${a})`; if(wd!=null)ctx.lineWidth=wd; }
function fink(a){ ctx.fillStyle=`rgba(26,22,18,${a})`; }
function fred(a){ ctx.fillStyle=`rgba(200,40,26,${a})`; }
function txt(s,x,y,size,a,col){ ctx.font=`${size}px Caveat`; ctx.fillStyle=col||`rgba(26,22,18,${a})`; ctx.textAlign='center'; ctx.fillText(s,x,y); }

// ─── Скетч-примитивы (стабильный boil-дребезг) ────────────────────────────────
function sl(x1,y1,x2,y2,w){ w=w==null?1.4:w; const dx=x2-x1,dy=y2-y1,steps=Math.max(2,Math.floor(Math.hypot(dx,dy)/9)); ctx.beginPath(); ctx.moveTo(x1+ww(w),y1+ww(w)); for(let i=1;i<=steps;i++){const t=i/steps; ctx.lineTo(x1+dx*t+ww(w),y1+dy*t+ww(w));} ctx.stroke(); }
function scir(cx,cy,r,w){ w=w==null?1.6:w; const steps=Math.max(14,Math.floor(r*0.7)); ctx.beginPath(); for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2; const rr=r+ww(w); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.stroke(); }
function sarc(cx,cy,r,a0,a1,w){ w=w==null?1.4:w; const steps=Math.max(6,Math.floor(Math.abs(a1-a0)*r*0.2)); ctx.beginPath(); for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps; const rr=r+ww(w); const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); }

// ─── Менеджер сцен с кросс-фейдом ─────────────────────────────────────────────
function scenes(p,arr){
  const n=arr.length, seg=1/n, fade=Math.min(0.045,seg*0.35);
  for(let i=0;i<n;i++){
    const start=i*seg, end=start+seg;
    if(p<start-fade||p>end+fade) continue;
    let a=1;
    if(i>0 && p<start+fade) a=(p-start+fade)/(2*fade);
    if(i<n-1 && p>end-fade) a=Math.min(a,(end+fade-p)/(2*fade));
    a=Math.max(0,Math.min(1,a)); if(a<=0.002) continue;
    const lp=Math.max(0,Math.min(1,(p-start)/seg));
    ctx.save(); ctx.globalAlpha=a; arr[i](lp,a); ctx.restore();
  }
}
// финальная сцена «висит» после конца — для затяжных концовок
function lastP(p,fromN){ return Math.max(0,Math.min(1,(p-(fromN-1)/fromN)*fromN)); }

// ─── Богатые компоненты ───────────────────────────────────────────────────────
function figure(x,y,o){
  o=o||{}; const s=o.s||1, a=o.a==null?0.82:o.a, ph=o.ph||0, lean=o.lean||0, raise=o.raise||0, fem=o.fem;
  ctx.save(); ctx.translate(x,y); ctx.rotate(lean); ctx.scale(s,s);
  ink(a,1.5/s);
  scir(0,-30,9,1.1);
  if(o.hair!=='none'){ ink(a*0.75,1/s); if(fem){ const fl=o.hairFlow||0; for(let i=-4;i<=4;i++) sl(i*2.1,-37,i*3+fl,(o.hairLong||-8),0.9);} else { for(let i=-3;i<=3;i++) sl(i*2.4,-38,i*2.4+ww(0.6),-33,0.7);} }
  const tx=Math.sin(ph)*1.4;
  sl(0,-21,tx,16,1.4/s);
  const aw=Math.sin(ph)*(o.swing||0);
  sl(0,-12,-10,-2+raise*-7,1.3/s); sl(-10,-2+raise*-7,-16+aw,(raise?-12:9),1.2/s);
  sl(0,-12,10,-2-raise*7,1.3/s); sl(10,-2-raise*7,16-aw,(raise?-12:9),1.2/s);
  const lw=Math.sin(ph)*(o.step||0);
  sl(tx,16,-7,32,1.3/s); sl(-7,32,-9-lw,50,1.2/s);
  sl(tx,16,7,32,1.3/s); sl(7,32,9+lw,50,1.2/s);
  if(fem){ ink(a,1.2/s); ctx.beginPath(); ctx.moveTo(-9,18); ctx.lineTo(-15,42); ctx.lineTo(15,42); ctx.lineTo(9,18); ctx.stroke(); }
  if(o.face) drawFace(0,-30,o.face,a);
  ctx.restore();
}
function drawFace(x,y,type,a){
  if(type==='x'){ red(a,1); sl(x-6,y-4,x-2,y,0.5); sl(x-2,y-4,x-6,y,0.5); sl(x+2,y-4,x+6,y,0.5); sl(x+6,y-4,x+2,y,0.5); }
  else { fink(a); ctx.beginPath(); ctx.arc(x-3.5,y-2,1.3,0,7); ctx.arc(x+3.5,y-2,1.3,0,7); ctx.fill(); }
  ink(a,0.9);
  if(type==='sad') sarc(x,y+7,4,Math.PI*1.15,Math.PI*1.85,0.5);
  else if(type==='happy') sarc(x,y+2,4,0.25,Math.PI-0.25,0.5);
  else if(type==='angry'){ sl(x-5,y-5,x-1,y-3,0.4); sl(x+1,y-3,x+5,y-5,0.4); sl(x-3,y+5,x+3,y+5,0.5); }
  else if(type==='cry'){ sarc(x,y+7,4,Math.PI*1.2,Math.PI*1.8,0.5); ctx.fillStyle=`rgba(60,90,170,${a*0.7})`; ctx.beginPath(); ctx.arc(x-3.5,y+3+((_frame*0.8)%14),1.2,0,7); ctx.arc(x+3.5,y+5+((_frame*0.8+7)%14),1.2,0,7); ctx.fill(); }
  else if(type==='flat') sl(x-3,y+5,x+3,y+5,0.5);
  else sl(x-3,y+4,x+3,y+5,0.5);
}
function cloud(cx,cy,r,a){ ink(a,1); scir(cx,cy,r,2); scir(cx-r*0.72,cy+r*0.28,r*0.6,1.8); scir(cx+r*0.72,cy+r*0.28,r*0.6,1.8); }
function bldg(x,yTop,w,base,a,rows){ ink(a,1.1); sl(x,base,x,yTop,1); sl(x+w,base,x+w,yTop,1); sl(x,yTop,x+w,yTop,1); if(rows){ for(let r=0;r<rows;r++)for(let c=0;c<3;c++){ const wx=x+(c+0.5)*w/3, wy=yTop+(r+0.7)*(base-yTop)/(rows+0.5); const lit=Math.sin(wx*9.13+wy*5.7+Math.floor(_frame/40))*0.5+0.5; ctx.fillStyle=`rgba(220,190,120,${a*0.45*(0.2+0.8*lit)})`; ctx.fillRect(wx-3,wy-5,6,9); ink(a*0.5,0.6); ctx.strokeRect(wx-3,wy-5,6,9);} } }
function windowFrame(x,y,w,h,a){ ink(a,1.5); sl(x,y,x+w,y,1.4); sl(x,y,x,y+h,1.4); sl(x+w,y,x+w,y+h,1.4); sl(x,y+h,x+w,y+h,1.4); sl(x+w/2,y,x+w/2,y+h,0.9); sl(x,y+h/2,x+w,y+h/2,0.9); }
function balloon(x,y,r,anchorX,anchorY,a){ red(a,1.4); scir(x,y,r,1.6); ctx.fillStyle=`rgba(200,40,26,${a*0.35})`; ctx.beginPath(); ctx.arc(x,y,r-1,0,7); ctx.fill(); ink(a*0.7,1); sl(x,y+r, (x+anchorX)/2+ww(3),(y+anchorY)/2, 1); sl((x+anchorX)/2,(y+anchorY)/2,anchorX,anchorY,1); }
function star5(x,y,r,a,fill){ ctx.beginPath(); for(let i=0;i<10;i++){const ang=i/5*Math.PI-Math.PI/2,rr=i%2?r*0.4:r; const px=x+Math.cos(ang)*rr,py=y+Math.sin(ang)*rr; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.closePath(); if(fill){ctx.fillStyle=fill;ctx.fill();} else {red(a,1.2);ctx.stroke();} }
function dust(W,H,a){ for(let i=0;i<14;i++){ const x=(Math.sin(i*53.1)*0.5+0.5)*W + Math.sin(_frame*0.01+i)*14; const y=((Math.cos(i*17.7)*0.5+0.5)*H + _frame*0.25*(0.5+i%3)) % H; ctx.fillStyle=`rgba(26,22,18,${a})`; ctx.beginPath(); ctx.arc(x,y,1+ (i%3)*0.5,0,7); ctx.fill(); } }
function vignettePulse(W,H,base){ const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.7); g.addColorStop(0,'rgba(4,2,0,0)'); g.addColorStop(1,`rgba(4,2,0,${base+0.04*EZ.pulse((_frame%180)/180)})`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
function ground(W,H,gy,a){ ink(a,1.4); sl(0,gy,W,gy,2); }

// ══════════════════════════════════════════════════════════════════════════════
// T1 — Семнадцать ножевых
// кухня (покой) → ссора → 17 ножей (счёт) → лужа крови → душа в облака
// ══════════════════════════════════════════════════════════════════════════════
function knives(){
  let t=0; _pg=-1;
  const drops=Array.from({length:17},(_,i)=>({x:0.5,y:0,vy:rnd(2.4,4),ang:rnd(-0.18,0.18),len:rnd(34,54),i}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    dust(W,H,0.05);
    scenes(p,[
      // 1. кухня — покой
      (lp)=>{
        ground(W,H,H*0.8,0.25);
        // стол
        ink(0.4,1.4); sl(W*0.32,H*0.62,W*0.68,H*0.62,1.4); sl(W*0.36,H*0.62,W*0.36,H*0.8,1.2); sl(W*0.64,H*0.62,W*0.64,H*0.8,1.2);
        // тарелки
        ink(0.35,1); scir(W*0.43,H*0.6,7,1); scir(W*0.57,H*0.6,7,1);
        // нож на столе (спокойно лежит)
        ink(0.45,1.2); sl(W*0.5,H*0.61,W*0.56,H*0.61,1.2);
        const br=Math.sin(t*0.05)*0.04;
        figure(W*0.34,H*0.46,{s:1.05,face:'happy',ph:br*3,a:0.78});
        figure(W*0.66,H*0.46,{s:1.05,face:'happy',fem:true,hairFlow:Math.sin(t*0.04)*3,ph:-br*3,a:0.78});
        // сердечко
        if(t%80<40){ txt('♥',W*0.5,H*0.4,16,0.4,'rgba(200,40,26,0.4)'); }
        txt('было тихо…',W*0.5,H*0.92,15,0.4);
      },
      // 2. ссора
      (lp)=>{
        ground(W,H,H*0.8,0.25);
        const shake=Math.sin(t*0.6)*lp*3;
        figure(W*0.34+shake,H*0.46,{s:1.05,face:'angry',a:0.8,raise:lp*0.6});
        figure(W*0.66-shake,H*0.46,{s:1.05,face:'angry',fem:true,a:0.8,raise:lp*0.7,hairFlow:Math.sin(t*0.2)*6});
        // каракули-крик
        red(0.4+lp*0.3,1.2);
        for(let i=0;i<4;i++){ const yy=H*(0.3+i*0.02); sl(W*0.44,yy,W*0.56,yy,1); }
        // нож поднимается
        ink(0.6,1.4); ctx.save(); ctx.translate(W*0.62,H*(0.5-lp*0.12)); ctx.rotate(-0.5+lp*0.3);
        sl(0,-18,2,10,1.3); ctx.fillStyle='rgba(55,35,15,0.6)'; ctx.fillRect(-3,10,6,12); ink(0.6,0.8); ctx.strokeRect(-3,10,6,12); ctx.restore();
        txt('ты подняла руку…',W*0.5,H*0.92,15,0.45);
      },
      // 3. 17 ножевых — счёт
      (lp)=>{
        ground(W,H,H*0.8,0.22);
        const n=Math.floor(lp*17);
        txt('17',W*0.5,H*0.62,W*0.5,0.05,'rgba(200,40,26,0.06)');
        // жертва (отшатывается)
        figure(W*0.5,H*0.5,{s:1.1,face:'sad',a:0.7,lean:Math.sin(t*0.3)*0.05});
        for(let i=0;i<17;i++){
          const d=drops[i]; const active=i<n;
          const fall=active?Math.min(1,((lp*17-i)*0.5)):0;
          if(!active) continue;
          const stuck=fall>=1;
          const ky=stuck?H*0.5+ (i%5-2)*8 : H*0.5-120*(1-fall);
          const kx=W*0.5 + ((i%2?1:-1)*(8+ (i*7)%70));
          ctx.save(); ctx.translate(kx,ky); ctx.rotate(d.ang+ (stuck?0:Math.sin(t*0.2+i)*0.05));
          ink(0.85,1.3); sl(0,-d.len*0.5,3,d.len*0.25,1.2);
          ctx.fillStyle='rgba(55,35,15,0.6)'; ctx.fillRect(-4,d.len*0.25,8,d.len*0.2); ink(0.7,0.7); ctx.strokeRect(-4,d.len*0.25,8,d.len*0.2);
          ctx.restore();
          if(stuck){ fred(0.5); ctx.beginPath(); ctx.arc(kx,ky+ (i%3)*6, 1.6+ (i%2),0,7); ctx.fill(); }
        }
        txt(n+' / 17',W*0.5,H*0.92,18,0.55,'rgba(200,40,26,0.6)');
      },
      // 4. лужа крови
      (lp)=>{
        ground(W,H,H*0.8,0.2);
        const r=EZ.out(lp)*W*0.44;
        const g=ctx.createRadialGradient(W*0.5,H*0.78,2,W*0.5,H*0.78,Math.max(2,r));
        g.addColorStop(0,'rgba(170,24,16,0.6)'); g.addColorStop(1,'rgba(170,24,16,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.8,Math.max(2,r),Math.max(1,r*0.3),0,0,7); ctx.fill();
        // лежащая фигура
        ctx.save(); ctx.translate(W*0.5,H*0.7); ctx.rotate(Math.PI*0.5);
        figure(0,0,{s:0.95,a:0.55,face:'flat'}); ctx.restore();
        // редкие ножи торчат
        ink(0.5,1.2); for(let i=0;i<6;i++){ const kx=W*(0.35+i*0.06); sl(kx,H*0.7,kx+2,H*0.78,1); }
        txt('кровь по полу…',W*0.5,H*0.92,15,0.45);
      },
      // 5. душа в облака
      (lp)=>{
        const rise=EZ.out(lp);
        for(let i=0;i<5;i++) cloud(W*(0.12+i*0.2)+Math.sin(t*0.01+i)*12,H*0.16+Math.cos(t*0.008+i)*8,18+i*3,0.18+rise*0.1);
        // лёгкий дождь
        ink(0.18,0.8); for(let i=0;i<10;i++){ const rx=W*(0.1+i*0.08), ry=(H*0.2 + (t*3+i*40)%(H*0.6)); sl(rx,ry,rx-1,ry+10,0.6); }
        // силуэт души
        const fy=H*(0.74-rise*0.5)+Math.sin(t*0.04)*5;
        figure(W*0.5,fy,{s:1,a:Math.max(0.25,0.7-rise*0.3),raise:0.9,face:'flat'});
        // нимб
        red(0.3+0.2*EZ.pulse((t%120)/120),1); scir(W*0.5,fy-44,12,2);
        txt('а я плыву в облаках',W*0.5,H*0.12,18,0.5);
      },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T2 — Детская травма
// солнечная площадка (один) → травля + снег → дом, один у окна → «ДЕТСКАЯ ТРАВМА»
// ══════════════════════════════════════════════════════════════════════════════
function trauma(){
  let t=0; _pg=-1;
  const snow=Array.from({length:70},()=>({x:rnd(0,1),y:rnd(0,1),r:rnd(1.4,3.4),s:rnd(0.4,1.4),drift:rnd(0,6.28)}));
  const taunts=['Илгиз','урод','иди сюда','мамкин','нет'];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      // 1. солнечная площадка, ребёнок один
      (lp)=>{
        ground(W,H,H*0.78,0.22);
        // солнце
        red(0.4,1.6); scir(W*0.83,H*0.16,22,2.5);
        ink(0.3,1); for(let i=0;i<10;i++){const a=i/10*6.28+t*0.005; sl(W*0.83+Math.cos(a)*26,H*0.16+Math.sin(a)*26,W*0.83+Math.cos(a)*34,H*0.16+Math.sin(a)*34,0.8);}
        // качели
        ink(0.4,1.4); sl(W*0.28,H*0.24,W*0.28,H*0.66,1.3); sl(W*0.5,H*0.24,W*0.5,H*0.66,1.3); sl(W*0.28,H*0.24,W*0.5,H*0.24,1.3);
        const sa=Math.sin(t*0.03)*0.22; ctx.save(); ctx.translate(W*0.39,H*0.24); ctx.rotate(sa);
        sl(-8,0,-8,H*0.3,1.2); sl(8,0,8,H*0.3,1.2); sl(-8,H*0.3,8,H*0.3,1.1); ctx.restore();
        // одинокий ребёнок
        figure(W*0.16,H*0.52,{s:0.85,face:'sad',a:0.55});
        // группа вдали (смеются, спиной)
        figure(W*0.72,H*0.54,{s:0.8,a:0.35,face:'happy'}); figure(W*0.8,H*0.54,{s:0.8,a:0.35,face:'happy'});
        txt('я всегда был один',W*0.5,H*0.9,15,0.4);
      },
      // 2. травля + снег пошёл
      (lp)=>{
        // снег
        snow.forEach(s=>{ s.y+=s.s*0.004; if(s.y>1)s.y=0; const x=s.x*W+Math.sin(t*0.02+s.drift)*12, y=s.y*H; ctx.fillStyle=`rgba(26,22,18,${0.1+lp*0.06})`; ctx.beginPath(); ctx.arc(x,y,s.r,0,7); ctx.fill(); });
        figure(W*0.32,H*0.54,{s:0.9,face:'sad',a:0.6,lean:Math.sin(t*0.4)*0.04});
        figure(W*0.66,H*0.54,{s:0.92,face:'angry',a:0.55,raise:0.6});
        // пузыри-оскорбления
        taunts.forEach((w,i)=>{ const ap=Math.max(0,Math.min(0.6,lp*1.4-i*0.22)); if(ap<=0)return; const bx=W*(0.2+i*0.16), by=H*(0.2+ (i%2)*0.08 + Math.sin(t*0.04+i)*0.01);
          ink(ap,1); scir(bx,by,26,2); txt(w,bx,by+4,13,ap+0.15); });
        txt('детская травма',W*0.5,H*0.9,16,0.45,'rgba(200,40,26,0.5)');
      },
      // 3. дом, один у окна, снегопад
      (lp)=>{
        snow.forEach(s=>{ s.y+=s.s*0.005; if(s.y>1)s.y=0; const x=s.x*W+Math.sin(t*0.02+s.drift)*14, y=s.y*H; ctx.fillStyle='rgba(26,22,18,0.1)'; ctx.beginPath(); ctx.arc(x,y,s.r,0,7); ctx.fill(); });
        // тёплое окно
        const wx=W*0.34,wy=H*0.26,ww2=W*0.32,wh=H*0.4;
        ctx.fillStyle=`rgba(220,180,110,${0.1+EZ.pulse((t%240)/240)*0.05})`; ctx.fillRect(wx,wy,ww2,wh);
        windowFrame(wx,wy,ww2,wh,0.5);
        // ребёнок прижался к стеклу
        figure(W*0.5,H*0.52,{s:0.95,face:'sad',a:0.6});
        ink(0.2,0.8); for(let i=0;i<5;i++){ const fx=wx+W*0.05+i*W*0.045; sl(fx,wy+H*0.05,fx,wy+wh-H*0.05,0.6); } // пар на стекле
        txt('январь, я дома, никого',W*0.5,H*0.9,15,0.4);
      },
      // 4. «ДЕТСКАЯ ТРАВМА» эхом
      (lp)=>{
        snow.forEach(s=>{ s.y+=s.s*0.004; if(s.y>1)s.y=0; ctx.fillStyle='rgba(26,22,18,0.07)'; ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,7); ctx.fill(); });
        const reps=5;
        for(let i=0;i<reps;i++){ const a=Math.max(0,EZ.out(lp)*(0.85-i*0.16)-i*0.03); if(a<=0)continue;
          ctx.save(); ctx.translate(W/2, H*0.3+i*H*0.13); ctx.rotate((i-2)*0.02);
          txt(i===0?'ДЕТСКАЯ ТРАВМА':'детская травма', 0,0, W*(0.16-i*0.022), a, `rgba(200,40,26,${a})`); ctx.restore(); }
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T3 — Вся моя жизнь говно
// ссора пары → куча мусора растёт + мухи → менты/собака → Сатана-брат, кайф в говне
// ══════════════════════════════════════════════════════════════════════════════
function trash(){
  let t=0; _pg=-1;
  const flies=Array.from({length:22},()=>({x:rnd(0.1,0.9),y:rnd(0.3,0.85),vx:rnd(-1.4,1.4),vy:rnd(-1,1),ph:rnd(0,6.28)}));
  function fly(fl,W,H,a){ fl.x+=(fl.vx+Math.sin(t*0.07+fl.ph)*0.8)/W; fl.y+=(fl.vy+Math.cos(t*0.06+fl.ph)*0.6)/H; if(fl.x<0)fl.x=1; if(fl.x>1)fl.x=0; if(fl.y<0.2)fl.y=0.88; if(fl.y>0.9)fl.y=0.2; const x=fl.x*W,y=fl.y*H; fink(a); ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fill(); ink(a*0.6,0.6); sl(x,y,x-5,y-3,0.5); sl(x,y,x+5,y-3,0.5); }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    ground(W,H,H*0.78,0.22);
    scenes(p,[
      (lp)=>{ // ссора
        figure(W*0.32,H*0.5,{s:1.05,face:'angry',a:0.75,raise:lp*0.5});
        figure(W*0.68,H*0.5,{s:1.05,face:'angry',fem:true,a:0.75,raise:lp*0.6});
        red(0.35,1); for(let i=0;i<3;i++) sl(W*0.42,H*(0.34+i*0.03),W*0.58,H*(0.34+i*0.03),1);
        txt('вся моя жизнь — говно',W*0.5,H*0.9,15,0.42);
      },
      (lp)=>{ // куча мусора растёт
        const grow=EZ.out(lp);
        ink(0.4,1.1);
        for(let i=0;i<14;i++){ const tx=W*(0.08+i*0.06), th=rnd(14,40)*grow, tw=rnd(20,42); sl(tx,H*0.78,tx,H*0.78-th,1); sl(tx,H*0.78-th,tx+tw,H*0.78-th,1); sl(tx+tw,H*0.78,tx+tw,H*0.78-th,1); }
        txt('ГОВНО',W*0.5,H*0.55,W*0.22,grow*0.12);
        const fc=Math.floor(flies.length*grow); for(let i=0;i<fc;i++) fly(flies[i],W,H,0.55);
        figure(W*0.5,H*0.45,{s:1,a:0.6,face:'happy'});
      },
      (lp)=>{ // менты + собака
        flies.forEach(fl=>fly(fl,W,H,0.55));
        // мигалка
        const flash=EZ.pulse((t%30)/30);
        ctx.fillStyle=`rgba(60,90,200,${0.12*flash})`; ctx.fillRect(0,0,W*0.5,H);
        ctx.fillStyle=`rgba(200,40,26,${0.12*(1-flash)})`; ctx.fillRect(W*0.5,0,W*0.5,H);
        figure(W*0.74,H*0.48,{s:0.95,a:0.6,face:'flat'});
        ink(0.5,1); txt('ДПС',W*0.74,H*0.3,12,0.5);
        // собака
        const dx=W*0.18,dy=H*0.62; ink(0.55,1.3); scir(dx+30,dy-15,9,1.4); sl(dx,dy,dx+22,dy,1.4); sl(dx+8,dy,dx+8,dy+18,1.2); sl(dx+18,dy,dx+18,dy+18,1.2); sl(dx+22,dy-15,dx+22+Math.sin(t*0.15)*8,dy-20,1.3);
        txt('менты во дворе',W*0.5,H*0.9,15,0.45);
      },
      (lp)=>{ // Сатана-брат, кайф
        flies.forEach(fl=>fly(fl,W,H,0.5));
        const q=EZ.out(lp);
        red(q*0.45,1.5); scir(W*0.78,H*0.3,20,2.2); sl(W*0.78-9,H*0.3-20,W*0.78-17,H*0.3-38,1.4); sl(W*0.78+9,H*0.3-20,W*0.78+17,H*0.3-38,1.4); sl(W*0.78,H*0.3+20,W*0.78,H*0.3+50,1.6);
        fred(q*0.8); ctx.beginPath(); ctx.arc(W*0.78-6,H*0.3-3,2.5,0,7); ctx.arc(W*0.78+6,H*0.3-3,2.5,0,7); ctx.fill();
        txt('Сатана — мой брат',W*0.78,H*0.14,13,q*0.7,`rgba(200,40,26,${q*0.7})`);
        // я кайфую в мусоре (плыву)
        const sw=Math.sin(t*0.05)*8; figure(W*0.3+sw,H*0.56,{s:1.05,a:0.7,face:'happy',raise:0.5});
        ink(0.3,1); for(let i=0;i<8;i++){ const wx2=W*(i*0.13+0.02), wy2=H*(0.7+Math.sin(t*0.04+i)*0.03); sl(wx2,wy2,wx2+W*0.1,wy2,1.4); }
        txt('но мне в нём хорошо',W*0.5,H*0.92,15,q*0.5);
      },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T4 — Будка
// злой батя рычит → превращение в пса → цепь и будка → план удался, сосед с ядом
// ══════════════════════════════════════════════════════════════════════════════
function doghouse(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    ground(W,H,H*0.8,0.22);
    scenes(p,[
      (lp)=>{ // злой батя
        const shake=Math.sin(t*0.7)*lp*2;
        figure(W*0.5+shake,H*0.42,{s:1.35,face:'angry',a:0.78,raise:lp*0.4});
        red(0.5,1.4); for(let i=0;i<4;i++){const a=-0.6+i*0.4; sl(W*0.5,H*0.28,W*0.5+Math.cos(a)*W*0.12,H*0.28-Math.abs(Math.sin(a))*H*0.08,1);}
        txt('батя злой как пёс',W*0.5,H*0.9,15,0.45,'rgba(200,40,26,0.55)');
        txt('РРР',W*0.5,H*0.14,18,0.4);
      },
      (lp)=>{ // превращение
        const m=EZ.io(lp);
        figure(W*0.5,H*0.42,{s:1.25,face:'angry',a:0.7});
        ink(0.7*m,1.4); // уши
        sl(W*0.44,H*0.27,W*0.4-m*10,H*0.27-m*24,1.4); sl(W*0.56,H*0.27,W*0.6+m*10,H*0.27-m*24,1.4);
        // морда
        ctx.beginPath(); ctx.ellipse(W*0.5,H*0.3,m*13,m*8,0,0,7); ctx.stroke();
        // появляется будка
        houseSketch(W*0.16,H*0.56,W*0.2*m,H*0.22*m,m*0.6);
        txt('я надену на него намордник',W*0.5,H*0.9,14,0.45);
      },
      (lp)=>{ // цепь и будка, лай
        houseSketch(W*0.1,H*0.5,W*0.22,H*0.28,0.65); txt('БУДКА',W*0.21,H*0.55,13,0.5);
        const dx=W*0.55+Math.sin(t*0.08)*8, dy=H*0.6; ink(0.65,1.3);
        scir(dx,dy-14,11,1.6); sl(dx-8,dy-14,dx-16,dy-27,1.4); sl(dx+8,dy-14,dx+16,dy-27,1.4);
        sl(dx,dy,dx,dy+28,1.6); sl(dx-10,dy+28,dx+10,dy+28,1.4);
        ink(0.4,0.9); ctx.setLineDash([5,5]); sl(W*0.32,H*0.62,dx,dy+12,1); ctx.setLineDash([]);
        if(t%40<20) txt('ГАВ!',dx,dy-32,17,0.55);
        txt('сидеть. молчать.',W*0.5,H*0.9,15,0.45);
      },
      (lp)=>{ // план удался
        houseSketch(W*0.1,H*0.5,W*0.22,H*0.28,0.6); txt('БУДКА',W*0.21,H*0.55,13,0.5);
        const dx=W*0.55, dy=H*0.62; ink(0.55,1.2); scir(dx,dy-14,11,1.6); sl(dx,dy,dx,dy+28,1.5);
        drawFace(dx,dy-14,'sad',0.55);
        const q=EZ.out(lp); figure(W*0.84,H*0.5,{s:0.9,a:q*0.6,face:'happy'});
        txt('яд',W*0.84,H*0.34,12,q*0.6,`rgba(200,40,26,${q*0.6})`);
        txt('план сработал',W*0.5,H*0.9,15,q*0.5);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
function houseSketch(x,y,w,h,a){ ink(a,1.5); sl(x,y+h,x,y,1.4); sl(x+w,y+h,x+w,y,1.4); sl(x,y+h,x+w,y+h,1.4); sl(x,y,x+w/2,y-h*0.55,1.4); sl(x+w,y,x+w/2,y-h*0.55,1.4); scir(x+w/2,y+h*0.45,Math.min(w,h)*0.18,1.4); }

// ══════════════════════════════════════════════════════════════════════════════
// T5 — Розовая могила (Карина)
// зеркало+тушь → вызов миру → надгробие растёт → розовый расцвет «живи и сдохни как король»
// ══════════════════════════════════════════════════════════════════════════════
function grave(){
  let t=0; _pg=-1;
  const petals=Array.from({length:26},(_,i)=>({a:i/26*6.28,r:0,rmax:rnd(40,90),s:rnd(0.4,1)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // зеркало + тушь
        const mx=W*0.5,my=H*0.4,mr=H*0.22; ink(0.5,1.4); scir(mx,my,mr,2); sl(mx,my+mr,mx,my+mr+28,1.4); sl(mx-18,my+mr+28,mx+18,my+mr+28,1.4);
        // отражение лица Карины
        scir(mx,my,15,1.6); drawFace(mx,my,'flat',0.6);
        // потёки туши
        ink(0.55,1); for(let i=0;i<3;i++){ const ex=mx-6+i*6; sl(ex,my+2,ex+rnd(-2,2),my+12+lp*10,0.8); }
        txt('если уходить — то красиво',W*0.5,H*0.85,15,0.45);
      },
      (lp)=>{ // вызов миру
        figure(W*0.5,H*0.46,{s:1.2,fem:true,a:0.75,face:'angry',raise:lp*0.7,hairFlow:Math.sin(t*0.1)*8});
        red(0.4,1.2); for(let i=0;i<6;i++){const a=i/6*6.28; sl(W*0.5+Math.cos(a)*40,H*0.4+Math.sin(a)*40,W*0.5+Math.cos(a)*(55+lp*15),H*0.4+Math.sin(a)*(55+lp*15),1);}
        ctx.fillStyle=`rgba(220,150,180,${lp*0.1})`; ctx.fillRect(0,0,W,H);
        txt('Карина красит губы назло',W*0.5,H*0.9,15,0.45);
      },
      (lp)=>{ // надгробие растёт
        const g=EZ.out(lp); const gtop=H*(0.78-g*0.42);
        ctx.fillStyle=`rgba(220,150,180,${g*0.13})`; ctx.fillRect(0,0,W,H);
        ink(0.6,1.5); sl(W*0.38,H*0.8,W*0.38,gtop,1.4); sl(W*0.62,H*0.8,W*0.62,gtop,1.4); sl(W*0.38,H*0.8,W*0.62,H*0.8,1.4);
        sarc(W*0.5,gtop,W*0.12,Math.PI,2*Math.PI,1.4);
        txt('КАРИНА',W*0.5,gtop+H*0.06,12+g*6,g*0.65); txt('🌸',W*0.5,gtop+H*0.12,18,g*0.6);
      },
      (lp)=>{ // розовый расцвет
        const b=EZ.out(lp); ctx.fillStyle=`rgba(220,150,180,${0.1+b*0.1})`; ctx.fillRect(0,0,W,H);
        ink(0.55,1.3); sl(W*0.38,H*0.8,W*0.38,H*0.33,1.4); sl(W*0.62,H*0.8,W*0.62,H*0.33,1.4); sl(W*0.38,H*0.8,W*0.62,H*0.8,1.4); sarc(W*0.5,H*0.33,W*0.12,Math.PI,2*Math.PI,1.4);
        txt('КАРИНА',W*0.5,H*0.42,14,0.6); txt('💀',W*0.5,H*0.48,16,0.5);
        petals.forEach(pe=>{ pe.r=Math.min(pe.rmax,pe.r+pe.s*(0.5+b)); const bx=W*0.5+Math.cos(pe.a)*pe.r, by=H*0.8+Math.sin(pe.a)*pe.r*0.4; ctx.strokeStyle='rgba(200,80,140,0.5)'; ctx.lineWidth=1; scir(bx,by,6+Math.sin(t*0.04+pe.a)*2,1.4); });
        txt('живи и сдохни как король',W*0.5,H*0.14,W*0.075,b*0.7,`rgba(200,80,140,${b*0.7})`);
      },
    ]);
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
// ══════════════════════════════════════════════════════════════════════════════
// T6 — Следак
// площадка, Полина исчезает → следак с лупой и делом → облака плачут, конфеты → «НАЙДИСЬ»
// ══════════════════════════════════════════════════════════════════════════════
function detective(){
  let t=0; _pg=-1;
  const rain=Array.from({length:40},()=>({x:rnd(0,1),y:rnd(0,1),s:rnd(3,6)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // площадка, Полина растворяется
        ground(W,H,H*0.78,0.2);
        ink(0.4,1.3); [W*0.26,W*0.5].forEach(sx=>{ sl(sx,H*0.2,sx,H*0.68,1.3); sl(sx+24,H*0.2,sx+24,H*0.68,1.3); sl(sx,H*0.2,sx+24,H*0.2,1.3); const sa=Math.sin(t*0.025+sx)*0.26; ctx.save(); ctx.translate(sx+12,H*0.2); ctx.rotate(sa); sl(-8,0,-8,H*0.34,1.2); sl(8,0,8,H*0.34,1.2); sl(-8,H*0.34,8,H*0.34,1.1); ctx.restore(); });
        figure(W*0.32,H*0.5,{s:0.85,fem:true,a:Math.max(0.05,0.45-lp*0.4),face:'flat'});
        txt('Полина…',W*0.32,H*0.22,13,Math.max(0,0.4-lp*0.35));
      },
      (lp)=>{ // следак с лупой
        ground(W,H,H*0.78,0.2);
        figure(W*0.36,H*0.46,{s:1.1,a:0.7,face:'flat'});
        // лупа
        ink(0.6,1.5); scir(W*0.52,H*0.5,22,2); sl(W*0.52+16,H*0.5+16,W*0.52+32,H*0.5+32,1.5);
        // увеличенный след под лупой
        ink(0.5,1); sl(W*0.49,H*0.52,W*0.55,H*0.48,0.8);
        // дело
        const fx=W*0.58,fy=H*0.56,fw=W*0.18,fh=H*0.13; ink(0.55,1.4); sl(fx,fy,fx+fw,fy,1.3); sl(fx,fy,fx,fy+fh,1.3); sl(fx+fw,fy,fx+fw,fy+fh,1.3); sl(fx,fy+fh,fx+fw,fy+fh,1.3); sl(fx,fy,fx+W*0.04,fy-H*0.03,1); sl(fx+W*0.04,fy-H*0.03,fx+W*0.1,fy-H*0.03,1);
        txt('ПОЛИНА',fx+fw/2,fy+fh*0.5,13,0.8,`rgba(200,40,26,${0.6+lp*0.2})`); txt('5 лет',fx+fw/2,fy+fh*0.85,11,0.5);
        cloud(W*0.5,H*0.14,30,0.25+lp*0.1);
      },
      (lp)=>{ // облака плачут + конфеты в песке
        [0.25,0.5,0.75].forEach((cx,i)=>cloud(W*cx,H*(0.12+i*0.02),30+i*6,0.4));
        rain.forEach(d=>{ d.y+=d.s*0.004; if(d.y>1)d.y=0.05; const x=d.x*W,y=d.y*H; ctx.fillStyle='rgba(60,80,160,0.35)'; ctx.beginPath(); ctx.arc(x,y,1.4,0,7); ctx.fill(); });
        ink(0.3,1); for(let i=0;i<5;i++){ const cx=W*(0.18+i*0.16); scir(cx,H*0.76,7,1.3); ctx.fillStyle='rgba(200,100,80,0.4)'; ctx.beginPath(); ctx.arc(cx,H*0.76,5,0,7); ctx.fill(); }
        txt('конфеты в песочнице',W*0.5,H*0.9,15,lp*0.5);
      },
      (lp)=>{ // НАЙДИСЬ
        rain.forEach(d=>{ d.y+=d.s*0.004; if(d.y>1)d.y=0; ctx.fillStyle='rgba(60,80,160,0.2)'; ctx.beginPath(); ctx.arc(d.x*W,d.y*H,1.2,0,7); ctx.fill(); });
        const pulse=1+EZ.pulse((t%90)/90)*0.08; ctx.save(); ctx.translate(W/2,H/2); ctx.scale(pulse,pulse);
        txt('НАЙДИСЬ',0,0,W*0.2,0.6+EZ.pulse((t%70)/70)*0.3,`rgba(200,40,26,${0.6+EZ.pulse((t%70)/70)*0.3})`); ctx.restore();
      },
    ]);
    vignettePulse(W,H,0.22); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T7 — Черновик
// город, девочка с шариком → грузовик → шарик улетает, дыра в сердце → та же улица, петля
// ══════════════════════════════════════════════════════════════════════════════
function notebook(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    ground(W,H,H*0.78,0.22);
    ink(0.18,1); [[0.05,0.45,0.12],[0.18,0.38,0.1],[0.78,0.4,0.12],[0.88,0.44,0.08]].forEach(([x,h,w])=>bldg(W*x,H*h,W*w,H*0.78,0.18,3));
    scenes(p,[
      (lp)=>{ // идут вместе, шарик
        const wx=W*(0.25+lp*0.12);
        figure(wx,H*0.55,{s:1,a:0.7,ph:t*0.15,step:6,face:'happy'});
        figure(wx+W*0.1,H*0.55,{s:0.92,fem:true,a:0.7,ph:t*0.15+1,step:6,face:'happy'});
        balloon(wx+W*0.1,H*0.28+Math.sin(t*0.05)*4,17,wx+W*0.1+8,H*0.45,0.7);
        txt('мы шли вдвоём',W*0.5,H*0.9,15,0.4);
      },
      (lp)=>{ // грузовик
        const tx=W*(0.85-EZ.in(lp)*0.4);
        ink(0.55,2); scir(tx,H*0.62,42,2.5); scir(tx,H*0.62,18,1.8);
        for(let i=0;i<6;i++){const a=i/6*6.28+t*0.05; sl(tx+Math.cos(a)*18,H*0.62+Math.sin(a)*18,tx+Math.cos(a)*40,H*0.62+Math.sin(a)*40,1.4);}
        // корпус грузовика
        ink(0.4,1.4); sl(tx-60,H*0.4,tx+30,H*0.4,1.4); sl(tx-60,H*0.4,tx-60,H*0.62,1.4); sl(tx+30,H*0.4,tx+30,H*0.62,1.4);
        red(EZ.bounce(lp)*0.6,1.2); for(let i=0;i<6;i++){const a=i/6*6.28; sl(tx,H*0.62,tx+Math.cos(a)*55,H*0.62+Math.sin(a)*38,1);}
        balloon(W*0.7+Math.sin(t*0.04)*16,H*(0.3-lp*0.2),16,W*0.7,H*0.4,0.6);
        txt('и в один миг…',W*0.5,H*0.9,15,0.5);
      },
      (lp)=>{ // шарик улетает + дыра в сердце
        balloon(W*0.72+Math.sin(t*0.025)*22,H*(0.12+Math.sin(t*0.015)*0.04),14,W*0.72,H*0.2,0.55);
        const hx=W*0.5,hy=H*0.5; ink(0.5,1.5);
        ctx.beginPath(); ctx.moveTo(hx,hy+24); ctx.bezierCurveTo(hx-36,hy+12,hx-44,hy-12,hx-28,hy-20); ctx.bezierCurveTo(hx-16,hy-28,hx,hy-14,hx,hy-14); ctx.bezierCurveTo(hx,hy-14,hx+16,hy-28,hx+28,hy-20); ctx.bezierCurveTo(hx+44,hy-12,hx+36,hy+12,hx,hy+24); ctx.stroke();
        red(0.7,1.3); ctx.beginPath(); ctx.moveTo(hx-12,hy-2); ctx.lineTo(hx-4,hy+4); ctx.lineTo(hx+4,hy-6); ctx.lineTo(hx+12,hy+2); ctx.stroke();
        txt('и в сердце — дыра',W*0.5,H*0.88,15,0.5);
      },
      (lp)=>{ // та же улица, петля
        balloon(W*0.78,H*0.1,12,W*0.78,H*0.16,0.4);
        const lx=((t*1.2)%(W*1.3))-W*0.15; figure(lx,H*0.62,{s:0.9,a:0.5,ph:t*0.15,step:6,face:'sad'});
        txt('третий месяц та же улица',W*0.5,H*0.88,14,0.4);
      },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T8 — Ты уебалась головой
// вечеринка, чокаются → удар головой (звёзды) → поезд + злая семья → один, «мама я люблю тебя»
// ══════════════════════════════════════════════════════════════════════════════
function head(){
  let t=0; _pg=-1;
  const notes=['♩','♪','♫','♬'];
  const np=Array.from({length:14},()=>({x:rnd(0,1),y:rnd(0,1),vy:rnd(0.6,1.6),n:notes[Math.floor(rnd(0,4))],a:rnd(0.3,0.7)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // вечеринка
        ground(W,H,H*0.8,0.2);
        figure(W*0.38,H*0.5,{s:1.05,a:0.78,ph:t*0.1,face:'happy'});
        figure(W*0.62,H*0.5,{s:1.05,fem:true,a:0.78,ph:t*0.1+1,face:'happy',hairFlow:Math.sin(t*0.1)*5});
        ink(0.55,1.3); sl(W*0.45,H*0.38,W*0.46,H*0.46,1.3); sl(W*0.55,H*0.38,W*0.54,H*0.46,1.3); sl(W*0.44,H*0.38,W*0.47,H*0.38,1.3); sl(W*0.53,H*0.38,W*0.56,H*0.38,1.3);
        if(t%60<30) red(0.6,1.2),sl(W*0.46,H*0.37,W*0.54,H*0.37,1.3);
        np.forEach(n=>{ n.y-=n.vy*0.004; if(n.y<0){n.y=0.7;n.x=rnd(0.2,0.8);} txt(n.n,n.x*W,n.y*H,16,n.a); });
        txt('было круто…',W*0.5,H*0.92,15,0.42);
      },
      (lp)=>{ // удар головой, звёзды
        ground(W,H,H*0.8,0.2);
        ctx.save(); ctx.translate(W*0.5,H*0.68); ctx.rotate(Math.PI*0.45);
        figure(0,0,{s:0.95,a:0.6,face:'x'}); ctx.restore();
        const nc=Math.floor(EZ.out(lp)*12)+3;
        for(let i=0;i<nc;i++){ const a=i/nc*6.28+t*0.03, r=EZ.out(lp)*W*0.25; star5(W*0.5+Math.cos(a)*(r+i*4),H*0.5+Math.sin(a)*(r*0.6+i*3),9+ (i%3)*4,0.6,null); }
        txt('ты уебалась головой',W*0.5,H*0.92,16,0.5,'rgba(200,40,26,0.6)');
      },
      (lp)=>{ // поезд + злая семья
        const tx=W*(0.85-EZ.io(lp)*1.3);
        ink(0.5,1.5); sl(tx,H*0.55,tx+W*0.5,H*0.55,1.4); sl(tx,H*0.68,tx+W*0.5,H*0.68,1.4); sl(tx,H*0.55,tx,H*0.68,1.4); sl(tx+W*0.5,H*0.55,tx+W*0.5,H*0.68,1.4);
        scir(tx+W*0.08,H*0.7,8,1.4); scir(tx+W*0.42,H*0.7,8,1.4);
        for(let i=0;i<3;i++) sl(tx+W*(0.07+i*0.14),H*0.58,tx+W*(0.13+i*0.14),H*0.58,1);
        sl(0,H*0.71,W,H*0.71,1.4);
        for(let i=0;i<4;i++){ const ap=Math.max(0,EZ.out(lp)-i*0.15); const fx=W*(0.12+i*0.26); ink(ap*0.6,1); scir(fx,H*0.32,16,2); drawFace(fx,H*0.32,'angry',ap*0.6); }
        txt('твоя семья меня возненавидела',W*0.5,H*0.9,14,0.45);
      },
      (lp)=>{ // один, мама
        ground(W,H,H*0.8,0.18);
        figure(W*0.5,H*0.52,{s:1.1,a:0.65,face:'sad'});
        figure(W*0.12,H*0.58,{s:0.6,fem:true,a:0.2+EZ.out(lp)*0.18,face:'flat'});
        const lines=['мама','я люблю тебя','мама','я люблю тебя'];
        lines.forEach((l,i)=>{ const a=Math.max(0,EZ.out(lp)-i*0.18); txt(l,W*0.5,H*(0.18+i*0.1),14+i*2,a*0.55); });
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T9 — Первокурсница
// смотрит из окна → её сияющий силуэт → к ней тянутся «сильные» руки → давление
// ══════════════════════════════════════════════════════════════════════════════
function student(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // окно, наблюдатель
        const wx=W*0.25,wy=H*0.2,ww2=W*0.5,wh=H*0.52;
        ctx.fillStyle=`rgba(240,220,180,${0.3+EZ.pulse((t%200)/200)*0.06})`; ctx.fillRect(wx,wy,ww2,wh);
        windowFrame(wx,wy,ww2,wh,0.5);
        figure(W*0.5,H*0.48,{s:1,fem:true,a:0.5,hairFlow:Math.sin(t*0.05)*4});
        ink(0.35,1.4); scir(W*0.05,H*0.42,9,1.4); // наблюдатель выглядывает
        ctx.fillStyle='rgba(26,22,18,0.35)'; ctx.beginPath(); ctx.arc(W*0.055,H*0.41,1.5,0,7); ctx.fill();
        txt('твои красивые глаза',W*0.5,H*0.84,15,0.4);
      },
      (lp)=>{ // сияющий силуэт
        ctx.fillStyle=`rgba(240,200,150,${EZ.out(lp)*0.2})`; ctx.fillRect(0,0,W,H);
        figure(W*0.5,H*0.4,{s:1.5,fem:true,a:0.55,hairFlow:Math.sin(t*0.04)*8,hairLong:6});
        ctx.strokeStyle=`rgba(240,200,100,${EZ.out(lp)*0.3})`; ctx.lineWidth=0.8;
        for(let i=0;i<10;i++){const a=i/10*6.28+t*0.01; sl(W*0.5+Math.cos(a)*55,H*0.4+Math.sin(a)*55,W*0.5+Math.cos(a)*85,H*0.4+Math.sin(a)*85,1);}
        txt('тебя красивую',W*0.5,H*0.85,15,0.45);
      },
      (lp)=>{ // руки тянутся
        figure(W*0.5,H*0.42,{s:1.1,fem:true,a:0.55,face:'sad'});
        const reach=EZ.out(lp);
        ink(0.5,1.6); // руки с краёв
        for(let s=-1;s<=1;s+=2){ const ox=W*0.5+s*W*0.5*(1-reach*0.6); sl(ox,H*0.5,W*0.5+s*40,H*0.45,1.5); scir(W*0.5+s*42,H*0.45,5,1); }
        red(reach*0.25,0.8); for(let i=0;i<6;i++) sl(W*0.5,H*0.42,W*(0.1+i*0.16),H*0.42,1);
        txt('ей нравятся те, кто силой',W*0.5,H*0.88,15,0.45);
      },
      (lp)=>{ // давление, замок/огонь
        const sm=1-EZ.out(lp)*0.4; figure(W*0.5,H*0.5,{s:1.1*sm,fem:true,a:0.55,face:'sad'});
        for(let i=0;i<5;i++){ const px=W*(0.12+i*0.18); figure(px,H*0.54,{s:1,a:EZ.out(lp)*0.6,face:'angry'}); }
        // замок
        ink(EZ.out(lp)*0.6,1.4); const lkx=W*0.5,lky=H*0.24; scir(lkx,lky,8,1.4); sl(lkx-6,lky,lkx-6,lky-10,1.2); sl(lkx+6,lky,lkx+6,lky-10,1.2); sarc(lkx,lky-10,6,Math.PI,2*Math.PI,1.2);
        txt('замок и спичка',W*0.5,H*0.9,14,EZ.out(lp)*0.45);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T10 — ЗППП
// крест+ЗППП → тела сближаются, вирусы → ВИЧ-хаус → тонут в Неве вместе
// ══════════════════════════════════════════════════════════════════════════════
function pills(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // крест + ЗППП
        red(0.7,2.2); sl(W*0.5-22,H*0.35,W*0.5+22,H*0.35,2); sl(W*0.5,H*0.2,W*0.5,H*0.5,2);
        txt('ЗППП',W*0.5,H*0.72,W*0.2,0.7,'rgba(200,40,26,0.7)');
        for(let i=0;i<6;i++){ const ax=W*(0.15+i*0.14), ay=H*(0.12+Math.sin(t*0.04+i)*0.05); txt('+',ax,ay,16,0.45,'rgba(200,40,26,0.45)'); }
      },
      (lp)=>{ // тела сближаются
        const gap=(1-EZ.io(lp))*W*0.26;
        figure(W*0.5-gap-22,H*0.5,{s:1,a:0.7,ph:t*0.06}); figure(W*0.5+gap+22,H*0.5,{s:1,fem:true,a:0.7,ph:t*0.06+1});
        fred(EZ.out(lp)*0.5); for(let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(W*0.5+Math.sin(t*0.05+i)*gap,H*0.42+Math.cos(t*0.04+i)*16,3,0,7); ctx.fill(); }
        txt('хочу подцепить от тебя',W*0.5,H*0.9,15,0.45);
      },
      (lp)=>{ // ВИЧ-хаус
        houseSketch(W*0.25,H*0.4,W*0.5,H*0.4,0.6);
        figure(W*0.4,H*0.62,{s:0.95,a:0.65}); figure(W*0.6,H*0.62,{s:0.95,fem:true,a:0.65});
        red(0.5+EZ.out(lp)*0.3,2); sl(W*0.5-14,H*0.45,W*0.5+14,H*0.45,2); sl(W*0.5,H*0.38,W*0.5,H*0.52,2);
        txt('ВИЧ-хаус',W*0.5,H*0.24,16,EZ.out(lp)*0.65,`rgba(200,40,26,${EZ.out(lp)*0.65})`);
        txt('умрём вместе, но потом',W*0.5,H*0.92,15,EZ.out(lp)*0.5);
      },
      (lp)=>{ // тонут в Неве
        const wl=H*(0.85-EZ.io(lp)*0.7);
        ctx.fillStyle=`rgba(40,70,140,${0.3+lp*0.25})`; ctx.fillRect(0,wl,W,H-wl);
        for(let i=0;i<5;i++){ const wy=wl+i*H*0.05; ctx.strokeStyle=`rgba(40,70,140,${0.4})`; ctx.lineWidth=1.4; ctx.beginPath(); for(let x=0;x<W;x+=6) ctx.lineTo(x,wy+Math.sin((x+t*2)*0.04)*5); ctx.stroke(); }
        const sy=H*(0.4+lp*0.3); ctx.globalAlpha=Math.max(0,1-lp*0.8); figure(W*0.46,sy,{s:0.95,a:0.7}); figure(W*0.56,sy+10,{s:0.9,fem:true,a:0.7}); ctx.globalAlpha=1;
        txt('утонем в Неве',W*0.5,H*0.12,16,lp*0.55);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T11 — Станцуй со мной
// пустой пол → приходит второй → танец → ноты-яд расходятся
// ══════════════════════════════════════════════════════════════════════════════
function dance(){
  let t=0; _pg=-1;
  const notes=Array.from({length:18},(_,i)=>({x:rnd(0,1),y:rnd(0.1,0.8),vy:rnd(0.3,1),n:['♩','♪','♫','♬'][i%4],a:0,poison:false}));
  function floor(W,H){ ground(W,H,H*0.8,0.2); ink(0.08,0.5); for(let x=0;x<W;x+=W*0.15) sl(x,H*0.8,x-W*0.1,H,0.5); for(let y=H*0.8;y<H;y+=H*0.06) sl(0,y,W,y,0.5); }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; floor(W,H);
    scenes(p,[
      (lp)=>{ figure(W*0.5+Math.sin(t*0.04)*6,H*0.55,{s:1.1,a:0.7,face:'flat'}); txt('станцуй со мной',W*0.5,H*0.18,16,0.4); txt('станцуй со мной',W*0.5,H*0.24,14,0.3); },
      (lp)=>{ figure(W*0.38+Math.sin(t*0.07)*12,H*0.54,{s:1.1,a:0.75,ph:t*0.12,step:4,face:'happy'}); const x2=W*(0.62+(1-EZ.out(lp))*0.4); figure(x2+Math.sin(t*0.07+1)*10,H*0.54,{s:1.1,fem:true,a:EZ.out(lp)*0.78,ph:t*0.12+1,step:4,face:'happy'}); notes.slice(0,Math.floor(EZ.out(lp)*notes.length)).forEach(n=>{ n.a=Math.min(0.7,n.a+0.015); n.y-=n.vy*0.004; if(n.y<0.05){n.y=0.75;n.x=rnd(0.1,0.9);} txt(n.n,n.x*W,n.y*H,18,n.a); }); },
      (lp)=>{ const s1=Math.sin(t*0.1)*14,s2=Math.sin(t*0.1+1.2)*12; figure(W*0.38+s1,H*0.54,{s:1.1,a:0.8,ph:t*0.15,step:5,face:'happy'}); figure(W*0.62+s2,H*0.54,{s:1.1,fem:true,a:0.8,ph:t*0.15+1,step:5,face:'happy',hairFlow:s2}); ctx.fillStyle=`rgba(80,160,80,${EZ.out(lp)*0.09})`; ctx.fillRect(0,0,W,H); notes.forEach((n,i)=>{ n.a=Math.min(0.75,n.a+0.015); n.y-=n.vy*0.004; if(n.y<0.05){n.y=0.75;n.x=rnd(0.1,0.9);} const poison=i/notes.length<EZ.out(lp); ctx.font='18px Caveat'; ctx.fillStyle=poison?`rgba(60,140,60,${n.a})`:`rgba(26,22,18,${n.a})`; ctx.textAlign='center'; ctx.fillText(n.n,n.x*W,n.y*H); }); txt('твои глаза как яд',W*0.5,H*0.13,16,EZ.out(lp)*0.6,'rgba(60,140,60,0.6)'); },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T12 — Верёвка
// площадка, измена (♥) → самолёт падает + верёвка на ветке → пьяная сцена + маятник
// ══════════════════════════════════════════════════════════════════════════════
function rope(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; ground(W,H,H*0.78,0.22);
    scenes(p,[
      (lp)=>{ for(let i=0;i<3;i++) figure(W*(0.14+i*0.12),H*0.55,{s:0.8,a:0.4,ph:t*0.08+i}); ink(0.35,1.3); sl(W*0.72,H*0.18,W*0.72,H*0.68,1.3); sl(W*0.88,H*0.18,W*0.88,H*0.68,1.3); sl(W*0.72,H*0.18,W*0.88,H*0.18,1.3); const sa=Math.sin(t*0.03)*0.3; ctx.save(); ctx.translate(W*0.8,H*0.18); ctx.rotate(sa); sl(-5,0,-5,H*0.38,1.2); sl(5,0,5,H*0.38,1.2); sl(-5,H*0.38,5,H*0.38,1.1); ctx.restore(); figure(W*0.6,H*0.55,{s:0.85,fem:true,a:0.5,face:'happy'}); figure(W*0.7,H*0.55,{s:0.85,a:0.5,face:'happy'}); if(t%50<25) txt('♥',W*0.65,H*0.38,16,0.5,'rgba(200,40,26,0.5)'); txt('ты целуешь другого',W*0.5,H*0.9,15,0.42); },
      (lp)=>{ const px=W*(0.78-EZ.in(lp)*0.5),py=H*(0.08+EZ.in(lp)*0.45),pa=Math.PI*0.28*lp; ctx.save(); ctx.translate(px,py); ctx.rotate(pa); ink(0.6,1.5); sl(-30,0,30,0,1.5); sl(-10,-5,-10,16,1.4); sl(10,-5,10,16,1.4); sl(28,-4,20,2,1); ctx.restore(); ink(0.2,1); for(let i=0;i<5;i++) scir(px-Math.cos(pa)*i*20,py-Math.sin(pa)*i*20,i*4+2,2); const ra=Math.sin(t*0.03)*0.35; ink(EZ.out(lp)*0.7,1.5); sl(W*0.1,H*0.28,W*0.35,H*0.28,1.5); sl(W*0.22,H*0.3,W*0.22+Math.sin(ra)*55,H*0.3+Math.cos(ra)*H*0.32,1.5); scir(W*0.22+Math.sin(ra)*55,H*0.3+Math.cos(ra)*H*0.32,8,1.6); txt('самолёт падает с неба',W*0.5,H*0.92,15,0.5); },
      (lp)=>{ const ra=Math.sin(t*0.035)*0.4; ink(0.55,1.5); sl(W*0.3,H*0.15,W*0.7,H*0.15,1.5); sl(W*0.5,H*0.15,W*0.5+Math.sin(ra)*70,H*0.15+Math.cos(ra)*H*0.48,1.5); scir(W*0.5+Math.sin(ra)*70,H*0.15+Math.cos(ra)*H*0.48,8,1.6); const sw=Math.sin(t*0.05)*8; figure(W*0.3+sw,H*0.57,{s:1,a:0.6,lean:Math.sin(t*0.05)*0.06,face:'flat'}); figure(W*0.45+sw*0.5,H*0.57,{s:0.9,a:0.55}); ink(0.45,1.3); sl(W*0.36,H*0.5,W*0.36,H*0.65,1.3); scir(W*0.36,H*0.5,7,1.4); for(let i=0;i<3;i++) figure(W*(0.62+i*0.12),H*0.57,{s:0.7,a:0.3,ph:t*0.08+i}); txt('«мне ничего не мешает» — шепчет верёвка',W*0.5,H*0.9,13,EZ.out(lp)*0.45); },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T13 — Я без ума от тебя
// тела рядом + облака → «Я БЕЗ УМА» растёт + дым → она прячется в капюшон → заражение
// ══════════════════════════════════════════════════════════════════════════════
function heart(){
  let t=0; _pg=-1;
  const parts=Array.from({length:26},()=>({x:0.5,y:0.5,vx:rnd(-2,2),vy:rnd(-2,2),r:rnd(2,6),a:0.8}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ const sw=Math.sin(t*0.04)*5; figure(W*0.42+sw,H*0.5,{s:1.1,a:0.75,ph:t*0.05}); figure(W*0.58-sw,H*0.5,{s:1.1,fem:true,a:0.75,ph:t*0.05+1,hairFlow:Math.sin(t*0.05)*5}); for(let i=0;i<3;i++) cloud(W*(0.22+i*0.28)+Math.sin(t*0.02+i*2)*12,H*0.22+Math.cos(t*0.015+i)*8,20+i*6,0.2+i*0.05); txt('наши тела двигались в такт',W*0.5,H*0.9,15,0.4); },
      (lp)=>{ const gap=(1-EZ.io(lp))*W*0.14; figure(W*0.5-gap,H*0.5,{s:1.1,a:0.7}); figure(W*0.5+gap,H*0.5,{s:1.1,fem:true,a:0.7}); txt('Я БЕЗ УМА',W*0.5,H*0.22,W*(0.1+EZ.out(lp)*0.12),EZ.out(lp)*0.65,`rgba(200,40,26,${EZ.out(lp)*0.65})`); ink(0.18,0.8); for(let i=0;i<4;i++) scir(W*(0.25+i*0.17)+Math.sin(t*0.03+i)*8,H*(0.62-i*0.03)+Math.cos(t*0.025+i)*5,8+i*3,2.5); },
      (lp)=>{ figure(W*0.5,H*0.52,{s:1.15,fem:true,a:0.65,hair:'none'}); ctx.fillStyle=`rgba(26,22,18,${EZ.out(lp)*0.45})`; ctx.beginPath(); ctx.arc(W*0.5,H*0.35,22+EZ.out(lp)*8,Math.PI,2*Math.PI); ctx.fill(); ['я без ума','я без ума','я без ума'].forEach((x,i)=>txt(x,W*0.5,H*(0.14+i*0.08),18,Math.max(0,0.5-i*0.14),`rgba(200,40,26,${Math.max(0,0.5-i*0.14)})`)); },
      (lp)=>{ parts.forEach(pa=>{ pa.x+=pa.vx/W; pa.y+=pa.vy/H; pa.a-=0.006; if(pa.a<=0){pa.x=0.5;pa.y=0.5;pa.vx=rnd(-2,2);pa.vy=rnd(-2,2);pa.a=0.8;} fred(pa.a*EZ.out(lp)); ctx.beginPath(); ctx.arc(pa.x*W,pa.y*H,pa.r,0,7); ctx.fill(); }); figure(W*0.5,H*0.52,{s:1.1,a:0.7}); txt('я без ума',W*0.5,H*0.22,W*0.18,0.45+EZ.pulse((t%80)/80)*0.2,`rgba(200,40,26,${0.45+EZ.pulse((t%80)/80)*0.2})`); txt('от тебя',W*0.5,H*0.32,W*0.08,0.4,'rgba(200,40,26,0.4)'); },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
// ══════════════════════════════════════════════════════════════════════════════
// T14 — Север
// трасса, машина → компас на С → линии скорости, город → фигура летит на север
// ══════════════════════════════════════════════════════════════════════════════
function north(){
  let t=0; _pg=-1;
  const streaks=Array.from({length:34},()=>({x:rnd(0,1),y:rnd(0,0.6),s:rnd(0.5,2.5),r:rnd(1,3)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // трасса
        ink(0.35,1.5); sl(W*0.15,H*0.9,W*0.45,H*0.5,1.5); sl(W*0.85,H*0.9,W*0.55,H*0.5,1.5); sl(W*0.45,H*0.5,W*0.55,H*0.5,1.5);
        ink(0.2,1); for(let i=0;i<7;i++){ const iy=((i/7)+ (t*0.004)%(1/7)); const cy=H*(0.5+iy*0.4), w=iy*0.4*W*0.06; sl(W*0.5-w,cy,W*0.5+w,cy,0.8); }
        const cx=W*0.5,cy=H*0.72; ink(0.55,1.5); sl(cx-28,cy+8,cx+28,cy+8,1.5); sl(cx-28,cy+8,cx-24,cy-10,1.5); sl(cx+28,cy+8,cx+24,cy-10,1.5); sl(cx-16,cy-10,cx+16,cy-10,1.5); sl(cx-24,cy-10,cx-16,cy-10,1.5); sl(cx+16,cy-10,cx+24,cy-10,1.5); scir(cx-18,cy+12,7,1.4); scir(cx+18,cy+12,7,1.4);
        ink(0.5,1); ctx.beginPath(); ctx.arc(cx-30,cy-2,4,0,7); ctx.fillStyle='rgba(220,200,120,0.5)'; ctx.fill(); ctx.beginPath(); ctx.arc(cx+30,cy-2,4,0,7); ctx.fill();
        txt('едем с юга на север',W*0.5,H*0.14,15,0.4);
      },
      (lp)=>{ // компас
        const cr=H*0.22; ink(0.5,2.5); scir(W*0.5,H*0.45,cr,2.5);
        const ang=-Math.PI/2+Math.sin(t*0.03)*(1-EZ.out(lp))*0.4;
        red(0.7,2); sl(W*0.5,H*0.45,W*0.5+Math.cos(ang)*cr*0.8,H*0.45+Math.sin(ang)*cr*0.8,1.5);
        ink(0.4,1); sl(W*0.5,H*0.45,W*0.5+Math.cos(ang+Math.PI)*cr*0.55,H*0.45+Math.sin(ang+Math.PI)*cr*0.55,1);
        [['С',0],['В',Math.PI/2],['Ю',Math.PI],['З',-Math.PI/2]].forEach(([l,a])=>txt(l,W*0.5+Math.cos(a-Math.PI/2)*(cr+14),H*0.45+Math.sin(a-Math.PI/2)*(cr+14)+4,13,0.55));
        txt('С Е В Е Р',W*0.5,H*0.15,W*0.12,EZ.out(lp)*0.6,`rgba(200,40,26,${EZ.out(lp)*0.6})`);
      },
      (lp)=>{ // полёт + линии скорости
        streaks.forEach(s=>{ s.x-=s.s*(1+EZ.out(lp)*4)*0.003; if(s.x<0)s.x=1; const x=s.x*W,y=s.y*H; fink(0.4); ctx.beginPath(); ctx.arc(x,y,s.r,0,7); ctx.fill(); ink(0.15,0.7); sl(x,y,x+s.s*(1+EZ.out(lp)*5)*3,y,0.5); });
        const fy=H*(0.5-EZ.out(lp)*0.18)+Math.sin(t*0.04)*10; ctx.save(); ctx.translate(W*0.5,fy); ctx.rotate(-0.2-EZ.out(lp)*0.15); figure(0,0,{s:1,a:0.7,raise:0.9}); ctx.restore();
        txt('СЕВЕР',W*0.5,H*0.14,W*0.12,EZ.out(lp)*0.55,`rgba(200,40,26,${EZ.out(lp)*0.55})`);
      },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T15 — Вата
// чёрт следит → пьяное качание → колени-вата подкашиваются → МЕСИВО
// ══════════════════════════════════════════════════════════════════════════════
function cotton(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; ground(W,H,H*0.8,0.2);
    scenes(p,[
      (lp)=>{ red(0.45,1.5); scir(W*0.85,H*0.28,18,2.2); sl(W*0.85-7,H*0.28-18,W*0.85-14,H*0.28-32,1.4); sl(W*0.85+7,H*0.28-18,W*0.85+14,H*0.28-32,1.4); fred(0.8); ctx.beginPath(); ctx.arc(W*0.85-7,H*0.28-4,3,0,7); ctx.arc(W*0.85+7,H*0.28-4,3,0,7); ctx.fill(); txt('чёрт смотрит',W*0.85,H*0.14,11,0.4,'rgba(200,40,26,0.4)'); figure(W*0.4,H*0.52,{s:1,a:0.6,face:'flat'}); figure(W*0.6,H*0.52,{s:0.95,fem:true,a:0.55,face:'sad'}); txt('пьяный вечер',W*0.5,H*0.9,15,0.4); },
      (lp)=>{ const sw=Math.sin(t*0.06)*18*EZ.out(lp); figure(W*0.42+sw,H*0.52,{s:1.1,a:0.7,lean:Math.sin(t*0.06)*0.08,face:'flat'}); const spin=10+EZ.out(lp)*8; ink(EZ.out(lp)*0.3,0.8); sarc(W*0.42+sw,H*0.32,spin,t*0.1,t*0.1+Math.PI*1.5,1); const shake=Math.sin(t*0.15)*3*EZ.out(lp); ink(0.45,1.2); sl(W*0.62+shake,H*0.6,W*0.78+shake,H*0.6,1.4); sl(W*0.62+shake,H*0.6,W*0.65+shake,H*0.72,1.3); sl(W*0.78+shake,H*0.6,W*0.75+shake,H*0.72,1.3); sl(W*0.65+shake,H*0.72,W*0.75+shake,H*0.72,1.3); txt('всё плывёт',W*0.5,H*0.9,15,0.4); },
      (lp)=>{ const knee=Math.sin(t*0.04)*5; ctx.save(); ctx.translate(W*0.5,H*0.42); ink(0.7,1.5); scir(0,-30,9,1.2); sl(0,-21,0,14,1.4); sl(0,-12,-18,5,1.3); sl(0,-12,18,5,1.3); sl(0,14,-8+knee,38,1.3); sl(-8+knee,38,-14-EZ.out(lp)*8,H*0.32,1.3); sl(0,14,8-knee,38,1.3); sl(8-knee,38,14+EZ.out(lp)*8,H*0.32,1.3); ctx.restore(); ink(EZ.out(lp)*0.25,0.8); for(let i=0;i<8;i++) scir(W*(0.1+i*0.11),H*(0.7+Math.sin(t*0.03+i)*0.05),rnd(8,16),2.5); txt('мои колени — вата',W*0.5,H*0.9,15,EZ.out(lp)*0.5); },
      (lp)=>{ const mess=['МЕСИВО','месиво','месиво','месиво','месиво']; mess.forEach((m,i)=>{ const a=Math.max(0,EZ.out(lp)-i*0.1); if(a<=0)return; ctx.save(); ctx.translate(W*(0.2+i*0.15),H*(0.2+i*0.12)); ctx.rotate((i-2)*0.18); txt(m,0,0,W*(0.2-i*0.02),a*(0.5-i*0.08)); ctx.restore(); }); ink(0.1,0.7); for(let i=0;i<12;i++) sl(rnd(0,W),rnd(0,H),rnd(0,W),rnd(0,H),2); },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T16 — Напорносайтах
// браузер → вкладки 18+ и набор текста → фигура у экрана сгорблена → мимо проходят
// ══════════════════════════════════════════════════════════════════════════════
function browser(){
  let t=0; _pg=-1;
  const tabs=['vk','yt','tg','18+','—','18+'];
  const target='мой батя совокупляется с соб...';
  function chrome(W,H,bx,by,bw,bh){ ink(0.5,1.5); sl(bx,by,bx+bw,by,1.4); sl(bx,by,bx,by+bh,1.4); sl(bx+bw,by,bx+bw,by+bh,1.4); sl(bx,by+bh,bx+bw,by+bh,1.4); sl(bx,by+H*0.06,bx+bw,by+H*0.06,1); ['rgba(200,60,60,0.6)','rgba(220,180,40,0.5)','rgba(60,180,60,0.5)'].forEach((c,i)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.arc(bx+12+i*18,by+H*0.03,5,0,7); ctx.fill(); }); }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const bx=W*0.08,by=H*0.12,bw=W*0.84,bh=H*0.68; chrome(W,H,bx,by,bw,bh);
    scenes(p,[
      (lp)=>{ ink(0.35,1); sl(bx+W*0.15,by+H*0.046,bx+bw-W*0.05,by+H*0.046,1); txt('мой батя сов...',bx+W*0.3,by+H*0.057,12,0.35); ctx.textAlign='center'; figure(W*0.3,H*0.52,{s:1,a:0.25,face:'sad'}); txt('даже собакам не нравится моё лицо',W*0.5,H*0.66,12,0.22); },
      (lp)=>{ tabs.slice(0,Math.floor(EZ.out(lp)*tabs.length+1)).forEach((tab,i)=>{ const tx=bx+i*(bw/tabs.length+2),ty=by-H*0.04; ink(0.4,1); sl(tx,ty,tx+bw/tabs.length,ty,1); sl(tx,ty,tx,by,1); sl(tx+bw/tabs.length,ty,tx+bw/tabs.length,by,1); txt(tab,tx+bw/tabs.length/2,ty+H*0.025,9,0.4,tab.includes('18')?'rgba(200,40,26,0.6)':'rgba(26,22,18,0.35)'); }); ink(0.35,1); sl(bx+W*0.15,by+H*0.046,bx+bw-W*0.05,by+H*0.046,1); const tl=Math.floor(EZ.out(lp)*target.length); ctx.font='12px Caveat'; ctx.fillStyle='rgba(26,22,18,0.5)'; ctx.textAlign='left'; ctx.fillText(target.slice(0,tl)+ (t%20<10?'|':''),bx+W*0.16,by+H*0.057); ctx.textAlign='center'; },
      (lp)=>{ ctx.fillStyle=`rgba(200,230,255,${EZ.out(lp)*0.1+ EZ.pulse((t%40)/40)*0.04})`; ctx.fillRect(bx+1,by+H*0.065,bw-2,bh-H*0.065); txt('18+ 18+ 18+ 18+ 18+',W*0.5,H*0.45,11,0.4,'rgba(200,40,26,0.4)'); figure(W*0.5,H*0.9,{s:0.9,a:0.6,face:'flat',lean:0.1}); ink(0.35,1.3); sl(W*0.2,H*0.84,W*0.8,H*0.84,1.4); if(EZ.out(lp)>0.5){ const passX=W*(1.1-(EZ.out(lp)-0.5)/0.5*1.4); figure(passX,H*0.55,{s:0.8,a:0.35,ph:t*0.15,step:5}); } txt('я за день ничего не сделал',W*0.5,H*0.99,12,0.4); },
    ]);
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T17 — По барабану
// ночь, окно → барабаны, бит → вулкан-взрыв → летят вдвоём
// ══════════════════════════════════════════════════════════════════════════════
function drum(){
  let t=0; _pg=-1;
  const sparks=Array.from({length:24},()=>({x:0.5,y:0.55,vx:rnd(-3,3),vy:rnd(-5,-1),a:0.9,r:rnd(2,5)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ const wx=W*0.3,wy=H*0.22,ww2=W*0.4,wh=H*0.38; ctx.fillStyle=`rgba(220,180,100,${0.12+EZ.pulse((t%200)/200)*0.05})`; ctx.fillRect(wx,wy,ww2,wh); windowFrame(wx,wy,ww2,wh,0.45); figure(W*0.5,H*0.56,{s:0.95,a:0.5,face:'flat'}); txt('3 часа ночи у тебя',W*0.5,H*0.9,15,0.4); },
      (lp)=>{ const m=EZ.out(lp); ink(0.6,1.5); scir(W*0.5,H*0.64,W*0.1*m,2); ctx.save(); ctx.scale(1,0.4); scir(W*0.5,H*0.98*m,W*0.07,2); ctx.restore(); sl(W*(0.5-0.14*m),H*(0.44*m+0.22),W*(0.5-0.08*m),H*(0.44*m+0.22),2); scir(W*(0.5+0.12*m),H*0.48,W*0.055*m,2); if(t%20<10){ red(0.6,1.3); sl(W*0.42,H*0.4,W*0.48,H*0.58,1.4); sl(W*0.6,H*0.38,W*0.54,H*0.56,1.4); } for(let i=0;i<3;i++){ const r=((t%30)/30)*W*0.25+i*W*0.08; ink(Math.max(0,0.2-i*0.06),0.8); scir(W*0.5,H*0.64,r,2); } txt('бьём по барабану',W*0.5,H*0.92,15,m*0.45); },
      (lp)=>{ const m=EZ.out(lp); sparks.forEach(sp=>{ sp.x+=sp.vx*(1+m*2)/W; sp.y+=(sp.vy+0.2)/H; sp.a-=0.012; if(sp.a<=0){sp.x=0.5;sp.y=0.62;sp.vx=rnd(-4,4);sp.vy=rnd(-6,-1);sp.a=0.9;} fred(sp.a*m); ctx.beginPath(); ctx.arc(sp.x*W,sp.y*H,sp.r,0,7); ctx.fill(); }); ink(0.5,1.5); sl(W*0.2,H*0.82,W*0.5,H*0.56,1.5); sl(W*0.8,H*0.82,W*0.5,H*0.56,1.5); sl(W*0.2,H*0.82,W*0.8,H*0.82,1.5); const fly=m*H*0.35; figure(W*0.42,H*0.48-fly,{s:0.9,a:0.7,raise:0.6}); figure(W*0.58,H*0.48-fly,{s:0.9,fem:true,a:0.7,raise:0.6}); txt('по барабану',W*0.5,H*0.16,W*0.1,m*0.45); },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T18 — Велосипед
// телефон звонит + колёса → едут вдвоём → дом горит + слежка → космос, «я придумал этот мир»
// ══════════════════════════════════════════════════════════════════════════════
function bicycle(){
  let t=0; _pg=-1;
  const stars=Array.from({length:28},()=>({x:rnd(0,1),y:rnd(0,0.5),r:rnd(1,3),tw:rnd(0,6.28)}));
  function bike(bx,by,a){ ink(a,1.5); const spin=t*0.12; scir(bx,by,22,2); scir(bx+W18*0.25,by,22,2); for(let i=0;i<5;i++){const ag=spin+i/5*6.28; sl(bx+Math.cos(ag)*22,by+Math.sin(ag)*22,bx+Math.cos(ag+Math.PI)*22,by+Math.sin(ag+Math.PI)*22,0.8); sl(bx+W18*0.25+Math.cos(ag)*22,by+Math.sin(ag)*22,bx+W18*0.25+Math.cos(ag+Math.PI)*22,by+Math.sin(ag+Math.PI)*22,0.8);} sl(bx,by,bx+W18*0.12,by-H18*0.14,1.5); sl(bx+W18*0.25,by,bx+W18*0.12,by-H18*0.14,1.5); sl(bx+W18*0.12,by-H18*0.14,bx+W18*0.06,by-H18*0.23,1.3); }
  let W18=0,H18=0;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); W18=W;H18=H; bg(W,H); const p=prog(); t++; ground(W,H,H*0.78,0.22);
    scenes(p,[
      (lp)=>{ ink(0.55,1.5); const phx=W*0.42,phy=H*0.35; sl(phx,phy,phx+W*0.16,phy,1.5); sl(phx,phy,phx,phy+H*0.24,1.5); sl(phx+W*0.16,phy,phx+W*0.16,phy+H*0.24,1.5); sl(phx,phy+H*0.24,phx+W*0.16,phy+H*0.24,1.5); if(t%30<15) txt('☎',phx+W*0.08,phy+H*0.14,18,0.6); for(let i=1;i<4;i++){ ink(Math.max(0,0.3-i*0.08),0.8); scir(phx-i*12,phy+H*0.12,i*8,2); scir(phx+W*0.16+i*12,phy+H*0.12,i*8,2); } bike(W*0.32,H*0.66,0.4); txt('позвони мне в любое время',W*0.5,H*0.16,15,0.4); },
      (lp)=>{ const bx=W*(0.05+EZ.out(lp)*0.45); bike(bx,H*0.65,0.6); figure(bx+W*0.12,H*0.44,{s:0.85,a:0.7,ph:t*0.2,face:'happy'}); figure(bx+W*0.2,H*0.46,{s:0.75,fem:true,a:0.65,hairFlow:8,face:'happy'}); txt('прокачу тебя на велосипеде',W*0.5,H*0.88,15,0.4); },
      (lp)=>{ houseSketch(W*0.2,H*0.42,W*0.28,H*0.36,0.5); red(0.6,1.5); for(let i=0;i<6;i++){ const fx=W*(0.22+i*0.05)+Math.sin(t*0.08+i)*6, fh=H*(0.08+Math.sin(t*0.06+i*1.4)*0.04)*EZ.out(lp); ctx.strokeStyle='rgba(200,80,20,0.6)'; sl(fx,H*0.42,fx,H*0.42-fh,1.5); } ctx.fillStyle=`rgba(200,80,20,${EZ.out(lp)*0.1})`; ctx.fillRect(0,0,W,H); const gx=W*(0.55+EZ.out(lp)*0.18); figure(gx,H*0.56,{s:0.95,fem:true,a:0.65,ph:t*0.15,step:5}); figure(gx-W*0.12,H*0.56,{s:0.85,a:EZ.out(lp)*0.55,ph:t*0.15,step:5,face:'flat'}); txt('я психованный, я слежу за тобой',W*0.5,H*0.9,14,EZ.out(lp)*0.5); },
      (lp)=>{ ctx.fillStyle=`rgba(10,8,30,${EZ.out(lp)*0.25})`; ctx.fillRect(0,0,W,H); stars.forEach(s=>{ const tw=0.4+0.6*EZ.pulse(((t*0.02+s.tw)%6.28)/6.28); ctx.fillStyle=`rgba(240,230,200,${EZ.out(lp)*0.7*tw})`; ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,7); ctx.fill(); }); [[0.1,0.18,0.22,0.35],[0.42,0.12,0.2,0.28],[0.68,0.22,0.24,0.32]].forEach(([x,y,w,h])=>{ ink(EZ.out(lp)*0.5,1.3); sl(W*x,H*y,W*(x+w),H*y,1.4); sl(W*x,H*y,W*x,H*(y+h),1.4); sl(W*(x+w),H*y,W*(x+w),H*(y+h),1.4); sl(W*x,H*(y+h),W*(x+w),H*(y+h),1.4); figure(W*(x+w/2),H*(y+h*0.55),{s:0.6,a:EZ.out(lp)*0.5}); }); txt('я придумал этот мир',W*0.5,H*0.85,W*0.1,EZ.out(lp)*0.6); },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T19 — Малолетки
// тусовка малолеток на фоне → подъезд, бутылка → раны на руке → вместе, качаемся
// ══════════════════════════════════════════════════════════════════════════════
function teens(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; ground(W,H,H*0.8,0.2);
    scenes(p,[
      (lp)=>{ for(let i=0;i<8;i++) figure(W*(0.05+i*0.12),H*0.55+Math.sin(t*0.06+i)*8,{s:0.65,a:0.25,ph:t*0.1+i,face:'happy'}); ink(0.12,0.6); for(let i=0;i<6;i++) sl(W*rnd(0.1,0.9),H*0.35,W*rnd(0.1,0.9),H*0.5,1); txt('пока малолетки бесятся',W*0.5,H*0.17,15,0.35); txt('ты хочешь быть со мной',W*0.5,H*0.22,15,0.4); },
      (lp)=>{ ink(0.35,1.3); sl(W*0.22,H*0.2,W*0.22,H*0.8,1.4); sl(W*0.78,H*0.2,W*0.78,H*0.8,1.4); sl(W*0.22,H*0.2,W*0.78,H*0.2,1.3); for(let i=0;i<5;i++) figure(W*(0.05+i*0.19),H*0.5,{s:0.55,a:0.12}); figure(W*0.38,H*0.52,{s:1,a:EZ.out(lp)*0.75,face:'flat'}); figure(W*0.62,H*0.52,{s:1,fem:true,a:EZ.out(lp)*0.75,face:'sad'}); ink(EZ.out(lp)*0.5,1.2); sl(W*0.5,H*0.7,W*0.5,H*0.8,1.3); scir(W*0.5,H*0.7,8,1.4); txt('подъезд',W*0.5,H*0.88,12,EZ.out(lp)*0.4); },
      (lp)=>{ figure(W*0.42,H*0.52,{s:1.05,a:0.7,face:'flat'}); figure(W*0.58,H*0.52,{s:1.05,fem:true,a:0.7,face:'sad'}); red(EZ.out(lp)*0.6,1.2); sl(W*0.35,H*0.58,W*0.42,H*0.58,1.4); sl(W*0.36,H*0.61,W*0.41,H*0.61,1.2); sl(W*0.36,H*0.64,W*0.4,H*0.64,1); ink(0.4,1); sl(W*0.5,H*0.72,W*0.5,H*0.8,1.2); scir(W*0.5,H*0.72,7,1.4); txt('слушаю плейлист того, кто повесился',W*0.5,H*0.13,11,EZ.out(lp)*0.35); },
    ]);
    vignettePulse(W,H,0.22); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T20 — Урод
// школа, отказ → мечта об интернет-славе ($, 1M) → неон «МОТЕЛЬ» → один за столом, мечта
// ══════════════════════════════════════════════════════════════════════════════
function mirror(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++; ground(W,H,H*0.8,0.2);
    scenes(p,[
      (lp)=>{ txt('🔔',W*0.5,H*0.18,20,0.5); figure(W*0.28,H*0.55,{s:1,a:0.65,face:'sad'}); ctx.save(); ctx.translate(W*0.68,H*0.55); ctx.scale(-1,1); figure(0,0,{s:1,fem:true,a:0.6,hairFlow:5}); ctx.restore(); ink(0.3,1); sl(W*0.52,H*0.42,W*0.44,H*0.42,1); txt('с первого класса… я урод',W*0.5,H*0.9,14,0.35); },
      (lp)=>{ ctx.fillStyle=`rgba(200,220,255,${EZ.out(lp)*0.12})`; ctx.fillRect(0,0,W,H); ink(0.5,1.5); sl(W*0.25,H*0.28,W*0.75,H*0.28,1.5); sl(W*0.25,H*0.28,W*0.25,H*0.65,1.5); sl(W*0.75,H*0.28,W*0.75,H*0.65,1.5); sl(W*0.25,H*0.65,W*0.75,H*0.65,1.5); txt('1 000 000',W*0.5,H*0.5,W*0.1,EZ.out(lp)*0.65,`rgba(200,40,26,${EZ.out(lp)*0.65})`); txt('подписчиков',W*0.5,H*0.6,12,EZ.out(lp)*0.5); for(let i=0;i<4;i++) txt('$',W*(0.15+i*0.23),H*(0.22-Math.sin(t*0.03+i)*0.06)*EZ.out(lp)+H*0.1,16,EZ.out(lp)*0.5,'rgba(80,140,60,0.5)'); figure(W*0.5,H*0.72,{s:0.9,a:EZ.out(lp)*0.5,face:'happy'}); },
      (lp)=>{ red(0.6,2); sl(W*0.2,H*0.3,W*0.8,H*0.3,2); sl(W*0.2,H*0.3,W*0.2,H*0.55,2); sl(W*0.8,H*0.3,W*0.8,H*0.55,2); sl(W*0.2,H*0.55,W*0.8,H*0.55,2); txt('МОТЕЛЬ',W*0.5,H*0.47,W*0.14,0.6+EZ.pulse((t%50)/50)*0.3,`rgba(200,40,26,${0.6+EZ.pulse((t%50)/50)*0.3})`); for(let i=0;i<4;i++){ ink(EZ.out(lp)*0.45,1); sl(W*(0.15+i*0.19),H*0.6,W*(0.15+i*0.19),H*0.78,1.3); sl(W*(0.28+i*0.19),H*0.6,W*(0.28+i*0.19),H*0.78,1.3); sl(W*(0.15+i*0.19),H*0.6,W*(0.28+i*0.19),H*0.6,1.3); sl(W*(0.15+i*0.19),H*0.78,W*(0.28+i*0.19),H*0.78,1.3); } },
      (lp)=>{ figure(W*0.5,H*0.62,{s:1,a:0.6,face:'flat'}); ink(0.35,1.3); sl(W*0.2,H*0.75,W*0.8,H*0.75,1.5); ink(EZ.out(lp)*0.3,1); scir(W*0.65,H*0.35,35,2.5); figure(W*0.65,H*0.35,{s:0.65,a:EZ.out(lp)*0.35,face:'happy'}); for(let i=1;i<=3;i++) scir(W*0.58,H*0.5+i*8,i*1.5,1); txt('а пока — только мечты',W*0.5,H*0.92,14,EZ.out(lp)*0.4); },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
// ══════════════════════════════════════════════════════════════════════════════
// T21 — Сигареты
// кривое фото вдвоём → балкон, город → сигаретный дым + её волосы заливают кадр
// ══════════════════════════════════════════════════════════════════════════════
function cigarette(){
  let t=0; _pg=-1;
  const smoke=Array.from({length:16},(_,i)=>({x:0.5,y:0.62,vx:rnd(-0.4,0.4),vy:rnd(-0.8,-0.3),r:rnd(5,13),a:0.5,delay:i*6}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ // кривое фото
        const fx=W*0.18,fy=H*0.12,fw=W*0.64,fh=H*0.62; ink(0.55,2); sl(fx,fy,fx+fw,fy,2); sl(fx,fy,fx,fy+fh,2); sl(fx+fw,fy,fx+fw,fy+fh,2); sl(fx,fy+fh,fx+fw,fy+fh,2);
        ink(0.2,1); sl(fx+4,fy+fh+1,fx+fw+4,fy+fh+1,1); sl(fx+fw+1,fy+4,fx+fw+4,fy+fh+1,1);
        figure(W*0.38,H*0.5,{s:1,a:0.65,face:'happy',lean:0.06});
        figure(W*0.62,H*0.5,{s:1,fem:true,a:0.65,face:'flat',hairFlow:Math.sin(t*0.04)*4});
        txt('на фото — уроды, но вдвоём нехуёво',W*0.5,H*0.88,14,0.4);
      },
      (lp)=>{ // балкон
        ink(0.25,1); [[0.04,0.5,0.08],[0.13,0.42,0.07],[0.72,0.44,0.1],[0.82,0.5,0.08]].forEach(([x,y,w])=>bldg(W*x,H*y,W*w,H*0.82,0.22,3));
        ink(0.45,1.5); sl(W*0.15,H*0.72,W*0.85,H*0.72,1.5); for(let i=0;i<8;i++) sl(W*(0.17+i*0.1),H*0.72,W*(0.17+i*0.1),H*0.82,1);
        figure(W*0.4,H*0.58,{s:0.95,a:EZ.out(lp)*0.75}); figure(W*0.6,H*0.58,{s:0.95,fem:true,a:EZ.out(lp)*0.75,hairFlow:Math.sin(t*0.05)*5});
        for(let i=0;i<8;i++){ const tw=0.4+0.6*EZ.pulse(((t*0.03+i)%6.28)/6.28); ctx.fillStyle=`rgba(26,22,18,${EZ.out(lp)*0.35*tw})`; ctx.beginPath(); ctx.arc(W*rnd(0.15,0.85),H*rnd(0.1,0.45),1.5,0,7); ctx.fill(); }
        txt('нехуёво',W*0.5,H*0.15,W*0.09,EZ.out(lp)*0.4);
      },
      (lp)=>{ // дым + волосы
        smoke.forEach(sp=>{ if(sp.delay>0){sp.delay--;return;} sp.x+=sp.vx/W; sp.y-=(Math.abs(sp.vy)+EZ.out(lp)*0.3)/H; sp.r+=0.08; sp.a-=0.005; if(sp.a<0){sp.x=0.5+rnd(-0.02,0.02);sp.y=0.62;sp.vx=rnd(-0.4,0.4);sp.r=rnd(5,12);sp.a=0.5;sp.delay=rnd(0,20);} ink(sp.a*0.5,0.6); scir(sp.x*W,sp.y*H,sp.r,2.5); });
        ink(0.55,1.5); sl(W*0.5-18,H*0.64,W*0.5+18,H*0.64,1.5); fred(0.6); ctx.beginPath(); ctx.arc(W*0.5+18,H*0.64,3,0,7); ctx.fill();
        ink(EZ.out(lp)*0.35,1.2); for(let i=0;i<8;i++){ const hx=W*(0.22+i*0.08),amp=H*0.3*EZ.out(lp); ctx.beginPath(); ctx.moveTo(hx,H*0.1); ctx.bezierCurveTo(hx+Math.sin(t*0.02+i)*20,H*0.3,hx+Math.cos(t*0.015+i)*25,H*0.5,hx+Math.sin(t*0.01+i)*15,H*0.1+amp); ctx.stroke(); }
        figure(W*0.5,H*0.6,{s:0.9,a:0.5});
        txt('хочу утонуть в её волосах',W*0.5,H*0.13,15,EZ.out(lp)*0.5);
      },
    ]);
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T22 — Неудобно
// ночная площадка, скамейка → примерочная, штора → идеи кончились «?»
// ══════════════════════════════════════════════════════════════════════════════
function awkward(){
  let t=0; _pg=-1;
  const locs=['горка','примерочная','чердак','лифт','парковка'];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ ground(W,H,H*0.8,0.2); ink(0.35,1.3); sl(W*0.22,H*0.3,W*0.22,H*0.68,1.4); sl(W*0.42,H*0.3,W*0.42,H*0.68,1.4); sl(W*0.22,H*0.3,W*0.42,H*0.3,1.3); sl(W*0.42,H*0.3,W*0.55,H*0.68,1.4); sl(W*0.22,H*0.68,W*0.55,H*0.68,1.3); sl(W*0.6,H*0.62,W*0.88,H*0.62,1.5); sl(W*0.65,H*0.62,W*0.65,H*0.72,1.3); sl(W*0.83,H*0.62,W*0.83,H*0.72,1.3); sl(W*0.65,H*0.72,W*0.83,H*0.72,1.3); figure(W*0.68,H*0.53,{s:0.9,a:0.6}); figure(W*0.78,H*0.53,{s:0.9,fem:true,a:0.6}); ink(0.3,1); scir(W*0.85,H*0.16,18,2); ctx.fillStyle='rgba(26,22,18,0.08)'; ctx.beginPath(); ctx.arc(W*0.85,H*0.16,17,0,7); ctx.fill(); txt('это так неудобно',W*0.5,H*0.9,15,0.4); },
      (lp)=>{ ink(0.5,1.5); sl(W*0.2,H*0.2,W*0.8,H*0.2,1.5); for(let i=0;i<8;i++){ ctx.beginPath(); ctx.arc(W*(0.2+i*0.09),H*0.2,3,0,7); ctx.stroke(); } const cx=W*(0.2+EZ.io(lp)*0.3); ctx.fillStyle='rgba(26,22,18,0.12)'; ctx.fillRect(W*0.2,H*0.2,cx-W*0.2,H*0.6); ink(0.35,1.2); sl(cx,H*0.2,cx,H*0.8,1.4); figure(W*0.42,H*0.52,{s:0.9,a:0.5}); figure(W*0.58,H*0.52,{s:0.9,fem:true,a:0.5}); txt('неудобно',W*0.5,H*0.14,W*0.1,EZ.out(lp)*0.4); ctx.textAlign='right'; txt(locs.slice(0,Math.ceil(EZ.out(lp)*3)).join(', '),W*0.9,H*0.9,12,EZ.out(lp)*0.35); ctx.textAlign='center'; },
      (lp)=>{ txt('?',W*0.5,H*0.6,W*0.28,EZ.out(lp)*0.12); locs.forEach((loc,i)=>{ const lp2=Math.min(1,EZ.out(lp)*1.5-i*0.1); if(lp2<=0)return; txt(loc,W*(0.18+i*0.16),H*0.38,14,lp2*0.35); if(lp2>0.5){ ink(lp2*0.45,1.2); sl(W*(0.11+i*0.16),H*0.38,W*(0.25+i*0.16),H*0.38,1); } }); txt('идеи закончились, а она хочет ещё',W*0.5,H*0.78,14,EZ.out(lp)*0.5); },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T23 — Тетрадь
// игнор сообщений (✓✓) → буквы «ШАЛАВА» появляются → страница чернеет злыми мыслями
// ══════════════════════════════════════════════════════════════════════════════
function journal(){
  let t=0; _pg=-1;
  const word='ШАЛАВА';
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const lPos=[{x:W*0.22,y:H*0.45},{x:W*0.34,y:H*0.42},{x:W*0.46,y:H*0.47},{x:W*0.58,y:H*0.43},{x:W*0.7,y:H*0.46},{x:W*0.5,y:H*0.6}];
    ink(0.12,0.7); for(let i=0;i<12;i++) sl(W*0.08,H*(0.15+i*0.07),W*0.92,H*(0.15+i*0.07),0.5);
    red(0.2,0.8); sl(W*0.14,H*0.12,W*0.14,H*0.92,0.5);
    scenes(p,[
      (lp)=>{ const msgs=['привет','ты где','ответь','ну пожалуйста','почему…']; msgs.forEach((m,i)=>{ const mp=Math.max(0,EZ.out(lp)*1.6-i*0.3); if(mp<=0)return; ink(mp*0.4,1); sl(W*0.2,H*(0.22+i*0.1),W*0.7,H*(0.22+i*0.1),1.2); sl(W*0.2,H*(0.22+i*0.1),W*0.2,H*(0.26+i*0.1),1); sl(W*0.7,H*(0.22+i*0.1),W*0.7,H*(0.26+i*0.1),1); sl(W*0.2,H*(0.26+i*0.1),W*0.7,H*(0.26+i*0.1),1.2); ctx.textAlign='left'; txt(m,W*0.22,H*(0.256+i*0.1),11,mp*0.55); ctx.textAlign='right'; txt('✓✓',W*0.68,H*(0.256+i*0.1),9,mp*0.3,`rgba(60,100,200,${mp*0.3})`); ctx.textAlign='center'; }); txt('глупые девочки не ведутся на мои очки',W*0.5,H*0.88,12,0.3); },
      (lp)=>{ const nL=Math.ceil(EZ.out(lp)*word.length); word.slice(0,nL).split('').forEach((ch,i)=>{ const cp=Math.min(1,EZ.out(lp)*word.length-i),pos=lPos[i]; txt(ch,pos.x,pos.y,W*0.1*cp,cp*0.75,`rgba(200,40,26,${cp*0.75})`); if(cp>0.5){ ink(cp*0.2,0.8); for(let j=0;j<3;j++) sl(pos.x+rnd(-20,20),pos.y+rnd(-12,12),pos.x+rnd(-20,20),pos.y+rnd(-12,12),1); } }); txt('мои глаза мокрые как сапоги',W*0.5,H*0.78,12,EZ.out(lp)*0.4); },
      (lp)=>{ word.split('').forEach((ch,i)=>{ const pos=lPos[i]; txt(ch,pos.x,pos.y,W*0.1,0.7,'rgba(200,40,26,0.7)'); }); ['надеюсь её найдут','глаза мокрые','отвали','ты хуже всех','зачем отвечать'].forEach((line,i)=>{ const lp2=Math.max(0,EZ.out(lp)-i*0.12); if(lp2<=0)return; ctx.save(); ctx.rotate((i%2?1:-1)*0.04); ctx.textAlign='left'; txt(line,W*(0.18),H*(0.65+i*0.06),11,lp2*0.4); ctx.restore(); ctx.textAlign='center'; }); ink(EZ.out(lp)*0.15,0.8); for(let i=0;i<6;i++) sl(W*rnd(0.15,0.85),H*rnd(0.6,0.9),W*rnd(0.15,0.85),H*rnd(0.6,0.9),1.5); },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T24 — Ванна, красный пол
// ванна, красный пол, «Айболит» зачёркнут → перевязка рук → велик вдвоём → цветок+кот+любовь
// ══════════════════════════════════════════════════════════════════════════════
function bath(){
  let t=0; _pg=-1;
  function bike2(bx,by,W,H,a){ ink(a,1.5); const spin=t*0.1; scir(bx,by,20,2); scir(bx+W*0.22,by,20,2); for(let i=0;i<5;i++){const ag=spin+i/5*6.28; sl(bx+Math.cos(ag)*20,by+Math.sin(ag)*20,bx+Math.cos(ag+Math.PI)*20,by+Math.sin(ag+Math.PI)*20,0.8);} sl(bx,by,bx+W*0.11,by-H*0.15,1.5); sl(bx+W*0.22,by,bx+W*0.11,by-H*0.15,1.5); }
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ ctx.fillStyle='rgba(180,28,18,0.15)'; ctx.fillRect(0,H*0.7,W,H*0.3); ink(0.35,1); sl(0,H*0.7,W,H*0.7,2); ink(0.55,1.5); sarc(W*0.5,H*0.56,W*0.26,0,Math.PI,1.5); sl(W*0.24,H*0.56,W*0.24,H*0.68,1.5); sl(W*0.76,H*0.56,W*0.76,H*0.68,1.5); sl(W*0.24,H*0.68,W*0.76,H*0.68,1.5); ink(0.4,1.2); sl(W*0.43,H*0.58,W*0.43,H*0.66,1.4); sl(W*0.57,H*0.58,W*0.57,H*0.66,1.4); txt('Айболит',W*0.5,H*0.24,14,0.35); red(0.5,2); sl(W*0.34,H*0.22,W*0.66,H*0.26,1.5); txt('нам уже не поможет',W*0.5,H*0.3,12,0.3); },
      (lp)=>{ ink(0.6,1.5); sl(W*0.3,H*0.5,W*0.52,H*0.5,2); sl(W*0.48,H*0.5,W*0.7,H*0.5,2); ctx.strokeStyle=`rgba(220,210,200,${EZ.out(lp)*0.7})`; ctx.lineWidth=3; for(let i=0;i<Math.floor(EZ.out(lp)*5);i++) sl(W*0.3+i*W*0.07,H*0.5-8,W*(0.3+i*0.07)+W*0.06,H*0.5+8,2.5); ink(0.3,1); for(let i=0;i<Math.floor(EZ.out(lp)*5);i++) sl(W*0.3+i*W*0.07,H*0.5-8,W*(0.3+i*0.07)+W*0.06,H*0.5+8,1.5); txt('всё будет хорошо',W*0.5,H*0.72,13,EZ.out(lp)*0.45); txt('я перемотаю твои руки',W*0.5,H*0.78,13,EZ.out(lp)*0.45); if(EZ.out(lp)>0.5) txt('♥',W*0.5,H*0.36,20,(EZ.out(lp)-0.5)*0.6,'rgba(200,40,26,0.6)'); },
      (lp)=>{ ground(W,H,H*0.72,0.22); const bx=W*(0.05+EZ.out(lp)*0.5); bike2(bx,H*0.65,W,H,0.6); figure(bx+W*0.11,H*0.42,{s:0.85,a:0.7,ph:t*0.2,face:'happy'}); figure(bx+W*0.17,H*0.44,{s:0.75,fem:true,a:0.65,hairFlow:8,face:'happy'}); ink(0.18,0.8); for(let i=0;i<4;i++){ const tx=W*(0.65+i*0.2)-EZ.out(lp)*W*0.5; sl(tx,H*0.72,tx,H*(0.48+rnd(0,0.12)),0.8); } txt('разгонимся на велике вдвоём',W*0.5,H*0.14,15,EZ.out(lp)*0.4); },
      (lp)=>{ const b=EZ.out(lp); const fh=H*0.35*b; ink(0.5,1.5); sl(W*0.28,H*0.75,W*0.28,H*0.75-fh,1.5); if(b>0.4){ for(let i=0;i<6;i++){const a=i/6*6.28,b2=(b-0.4)/0.6; ctx.strokeStyle='rgba(200,80,140,0.55)'; ctx.lineWidth=1; scir(W*0.28+Math.cos(a)*14*b2,H*0.75-fh+Math.sin(a)*10*b2,8*b2,2);} ctx.fillStyle='rgba(200,160,80,0.5)'; ctx.beginPath(); ctx.arc(W*0.28,H*0.75-fh,7,0,7); ctx.fill(); } if(b>0.3){ const cp=(b-0.3)/0.7,cx=W*0.62,cy=H*0.6; ink(cp*0.55,1.3); scir(cx,cy,18,2); sl(cx-10,cy-18,cx-16,cy-30,1.5); sl(cx+10,cy-18,cx+16,cy-30,1.5); sl(cx,cy+18,cx,cy+45,2); sarc(cx+18,cy+45,18,-Math.PI*0.5,Math.PI*0.5,1.5); fink(cp*0.7); ctx.beginPath(); ctx.arc(cx-6,cy-2,2.5,0,7); ctx.arc(cx+6,cy-2,2.5,0,7); ctx.fill(); if(t%40<20) txt('мурр',cx+30,cy-12,11,cp*0.4); } txt('чтобы ты знала как я люблю тебя',W*0.5,H*0.14,W*0.085,b*0.55); txt('♥',W*0.5,H*0.25,22,b*0.65,'rgba(200,40,26,0.65)'); },
    ]);
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T25 — Все мои поступки
// «УБЛЮДОК» → спираль поступков → петарды в спальне, звонок маме → бесконечная петля
// ══════════════════════════════════════════════════════════════════════════════
function chaos(){
  let t=0; _pg=-1;
  const aWords=['нассал в подъезде','написал что ненавижу','КОНЧЕНЫЕ','ублюдок','смотрю в глаза','всё конченое','ненавижу','снова'];
  const sparks=Array.from({length:16},()=>({x:0.5,y:0.5,vx:rnd(-4,4),vy:rnd(-5,-1),a:1,r:rnd(2,5)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ const pulse=1+EZ.pulse((t%80)/80)*0.05; ctx.save(); ctx.translate(W/2,H/2); ctx.scale(pulse,pulse); txt('УБЛЮДОК',0,0,W*0.2,0.65); ctx.restore(); ink(0.12,0.8); for(let i=0;i<5;i++){ const y=H*(0.15+i*0.16); sl(W*0.1,y,W*0.9,y,1); sl(W*0.1,y,W*0.1,y+H*0.16,1); sl(W*0.9,y,W*0.9,y+H*0.16,1); } txt('смотри мне в глаза — там ничего',W*0.5,H*0.9,14,0.3); },
      (lp)=>{ aWords.slice(0,Math.ceil(EZ.out(lp)*aWords.length)).forEach((w,i)=>{ const ang=(i/aWords.length)*6.28+t*0.015, r=W*0.28+i*8; const wx=W*0.5+Math.cos(ang)*r, wy=H*0.5+Math.sin(ang)*r*0.6; const wp=Math.min(1,EZ.out(lp)*aWords.length-i); txt(w,wx,wy,10+i%3*2,wp*0.45); }); txt('УБЛЮДОК',W*0.5,H*0.5,W*0.13,EZ.out(lp)*0.35); },
      (lp)=>{ ink(0.3,1); sl(W*0.1,H*0.2,W*0.9,H*0.2,1.5); sl(W*0.1,H*0.2,W*0.1,H*0.85,1.5); sl(W*0.9,H*0.2,W*0.9,H*0.85,1.5); sl(W*0.1,H*0.85,W*0.9,H*0.85,1.5); sparks.forEach(sp=>{ sp.x+=sp.vx/W; sp.y+=(sp.vy+0.3)/H; sp.a-=0.015; if(sp.a<0){sp.x=0.3+Math.random()*0.4;sp.y=0.6;sp.vx=rnd(-4,4);sp.vy=rnd(-5,-0.5);sp.a=0.9;} ctx.fillStyle=`rgba(200,120,20,${sp.a*EZ.out(lp)})`; ctx.beginPath(); ctx.arc(sp.x*W,sp.y*H,sp.r,0,7); ctx.fill(); }); figure(W*0.5,H*0.58,{s:1,a:0.6,face:'angry'}); ink(EZ.out(lp)*0.4,1.3); sl(W*0.68,H*0.38,W*0.76,H*0.38,1.3); sl(W*0.68,H*0.38,W*0.68,H*0.52,1.3); sl(W*0.76,H*0.38,W*0.76,H*0.52,1.3); sl(W*0.68,H*0.52,W*0.76,H*0.52,1.3); txt('мама',W*0.72,H*0.46,10,EZ.out(lp)*0.45); },
      (lp)=>{ const loop=((t*0.5)%aWords.length); txt('все мои поступки',W*0.5,H*0.35,W*0.15,0.5+EZ.pulse((t%80)/80)*0.25,`rgba(200,40,26,${0.5+EZ.pulse((t%80)/80)*0.25})`); txt('конченые',W*0.5,H*0.52,W*0.1,0.4); aWords.forEach((w,i)=>{ const a=Math.max(0,0.35-Math.abs(loop-i)*0.12); txt(w,W*(0.2+i%3*0.3),H*(0.62+Math.floor(i/3)*0.1),13,a); }); sparks.forEach(sp=>{ sp.x+=sp.vx*1.2/W; sp.y+=(sp.vy+0.3)/H; sp.a-=0.018; if(sp.a<0){sp.x=0.2+Math.random()*0.6;sp.y=0.75;sp.vx=rnd(-4,4);sp.vy=rnd(-4,-0.5);sp.a=0.9;} fred(sp.a*0.6); ctx.beginPath(); ctx.arc(sp.x*W,sp.y*H,sp.r,0,7); ctx.fill(); }); },
    ]);
    vignettePulse(W,H,0.22); grain();
    rafId=requestAnimationFrame(f);
  } f();
}

// ══════════════════════════════════════════════════════════════════════════════
// T26 — Прыгай, дура!
// дверь клуба + свет → «ПРЫГАЙ ДУРА» прыгает + Aperol → прыгающая фигура → конфетти, до утра
// ══════════════════════════════════════════════════════════════════════════════
function jump(){
  let t=0; _pg=-1;
  const conf=Array.from({length:26},()=>({x:rnd(0,1),y:rnd(-1,1),vx:rnd(-1.5,1.5),vy:rnd(1,3),c:['rgba(200,40,26,0.6)','rgba(40,120,200,0.5)','rgba(200,180,40,0.6)','rgba(40,180,100,0.5)'][Math.floor(rnd(0,4))],w:rnd(6,14),h:rnd(4,8)}));
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    scenes(p,[
      (lp)=>{ ink(0.5,1.5); const dx=W*0.35,dy=H*0.25,dw=W*0.3,dh=H*0.55; sl(dx,dy,dx+dw,dy,1.5); sl(dx,dy,dx,dy+dh,1.5); sl(dx+dw,dy,dx+dw,dy+dh,1.5); sl(dx,dy+dh,dx+dw,dy+dh,1.5); sl(dx+dw/2,dy,dx+dw/2,dy+dh,1); ctx.fillStyle=`rgba(220,200,100,${0.14+EZ.pulse((t%30)/30)*0.06})`; ctx.fillRect(dx+1,dy+1,dw-2,dh-2); ctx.strokeStyle='rgba(220,200,100,0.25)'; ctx.lineWidth=1; for(let i=0;i<5;i++){const ang=(i-2)*0.25; sl(dx+dw/2,dy+dh/2,dx+dw/2+Math.cos(ang)*W*0.4,dy+dh/2+Math.sin(ang)*H*0.4,0.8);} txt('снимай колготки, у меня есть алкоголь',W*0.5,H*0.88,13,0.4); },
      (lp)=>{ const bounce=Math.abs(Math.sin(t*0.12))*(1+EZ.out(lp)*0.5); const by2=H*(0.38-bounce*0.12); txt('ПРЫГАЙ',W*0.5,by2,W*0.22,0.6+EZ.out(lp)*0.3,`rgba(200,40,26,${0.6+EZ.out(lp)*0.3})`); txt('ДУРА!',W*0.5,by2+H*0.18,W*0.14,0.5+EZ.out(lp)*0.25); const gx=W*0.78,gy=H*0.45; ctx.strokeStyle='rgba(200,80,20,0.55)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(gx-14,gy); ctx.lineTo(gx+14,gy); ctx.lineTo(gx+8,gy+H*0.22); ctx.lineTo(gx-8,gy+H*0.22); ctx.closePath(); ctx.stroke(); ctx.fillStyle='rgba(200,80,20,0.2)'; ctx.fill(); txt('Aperol лечит мои раны',W*0.3,H*0.18,11,0.3); },
      (lp)=>{ const jh=Math.abs(Math.sin(t*0.14))*H*0.25; figure(W*0.5,H*0.65-jh,{s:1.15,fem:true,a:0.8,raise:0.7,hairFlow:Math.sin(t*0.3)*10,face:'happy'}); if(EZ.out(lp)>0.4){ figure(W*0.88,H*0.58,{s:0.8,a:(EZ.out(lp)-0.4)/0.6*0.4,face:'flat'}); txt('серьёзный как мент',W*0.88,H*0.37,10,(EZ.out(lp)-0.4)/0.6*0.3); } ctx.fillStyle=`rgba(200,40,26,${(0.08+Math.abs(Math.sin(t*0.14))*0.08)*EZ.out(lp)})`; ctx.fillRect(0,0,W,H); txt('прыгай со мной',W*0.5,H*0.14,W*0.12,0.4+EZ.out(lp)*0.3,`rgba(200,40,26,${0.4+EZ.out(lp)*0.3})`); },
      (lp)=>{ ctx.fillStyle=`rgba(200,40,26,${0.05+Math.abs(Math.sin(t*0.18))*0.06})`; ctx.fillRect(0,0,W,H); conf.forEach(c=>{ c.x+=c.vx/W; c.y+=c.vy/H; if(c.y>1.05)c.y=-0.05; ctx.save(); ctx.translate(c.x*W,c.y*H); ctx.rotate(t*0.05+c.x*10); ctx.fillStyle=c.c; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h); ctx.restore(); }); const jh=Math.abs(Math.sin(t*0.16))*H*0.22; figure(W*0.38,H*0.62-jh,{s:1.1,a:0.75,raise:0.6,face:'happy'}); figure(W*0.62,H*0.62-jh,{s:1.05,fem:true,a:0.75,raise:0.6,hairFlow:Math.sin(t*0.3)*10,face:'happy'}); txt('ПРЫГАЙ!',W*0.5,H*0.2,W*0.18,0.5+EZ.pulse((t%60)/60)*0.3,`rgba(200,40,26,${0.5+EZ.pulse((t%60)/60)*0.3})`); txt('до утра',W*0.5,H*0.3,W*0.08,EZ.out(lp)*0.45); },
    ]);
    vignettePulse(W,H,0.12); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
