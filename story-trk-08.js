// ════════════════════════════════════════════════════════════════════════════
// T8 — Ты уебалась головой  (ЭТАЛОН++ : 8 актов, максимум движения)
// Арка: тёплая попойка → удар у двери → семья-стена → флешбэк → пустота →
//       поезд уезжает → мама вдали «мама, я люблю тебя».
// ════════════════════════════════════════════════════════════════════════════
function head(){
  let t=0; _pg=-1;
  const parts=mkParts(320);
  const C=[150,52,52], WARM=[210,150,70];
  const rain=mkRain(46);
  let _hit=-1, _shatter=-1;
  const rings=[];                 // расходящиеся кольца удара
  const cracks=[];                // трещины «экрана» при ударе
  const gdrops=Array.from({length:22},()=>({x:rnd(0.08,0.92),y:rnd(0,1),v:rnd(0.002,0.007),len:rnd(10,26),w:rnd(0.8,1.6)})); // капли по стеклу

  // ── декорации ──
  function room(W,H,gy,warm){
    ink(0.30,1.2); sl(0,gy*0.62,W,gy*0.62,1);
    windowFrame(W*0.66,gy*0.16,W*0.2,gy*0.32,0.32);
    if(warm>0){ const fl=0.06*warm*(0.85+0.15*Math.sin(t*0.3)); ctx.fillStyle=`rgba(210,150,70,${fl})`; ctx.fillRect(W*0.66,gy*0.16,W*0.2,gy*0.32); }
    ground(W,H,gy,0.25);
  }
  function table(W,gy,a){ ink(a,1.4); sl(W*0.36,gy*0.78,W*0.64,gy*0.78,1.5); sl(W*0.40,gy*0.78,W*0.40,gy,1.2); sl(W*0.60,gy*0.78,W*0.60,gy,1.2); }
  function candle(W,gy,a){
    const fl=Math.sin(t*0.3)*0.4+Math.sin(t*0.17)*0.2;
    ink(a,1); sl(W*0.49,gy*0.78,W*0.49,gy*0.72,1); sl(W*0.51,gy*0.78,W*0.51,gy*0.72,1); sl(W*0.49,gy*0.78,W*0.51,gy*0.78,1);
    ctx.fillStyle=`rgba(230,160,60,${a*0.85})`; ctx.beginPath(); ctx.ellipse(W*0.5+ww(0.8),gy*0.72-7,2.6*(1+fl*0.3),5.2*(1+fl*0.2),0,0,7); ctx.fill();
    ctx.fillStyle=`rgba(255,210,120,${a*0.5})`; ctx.beginPath(); ctx.arc(W*0.5,gy*0.72-7,1.4+fl,0,7); ctx.fill();
  }
  function boombox(W,gy,a){
    // корпус на полу справа от стола; катушки крутятся, динамик пульсирует по биту
    const bx=W*0.74,by=gy*0.9,bw=W*0.14,bh=gy*0.12;
    ink(a,1.3); srect(bx,by-bh,bw,bh,1.2);
    const beat=AUD.beat;
    for(let i=0;i<2;i++){ const cx=bx+bw*(0.32+i*0.36),cy=by-bh*0.55,r=bh*0.22;
      ink(a,1); scir(cx,cy,r,0.9); const an=t*0.25; for(let k=0;k<3;k++){const aa=an+k*2.09; sl(cx,cy,cx+Math.cos(aa)*r,cy+Math.sin(aa)*r,0.7);} }
    // динамик
    const sc=bh*0.3*(1+beat*0.4); ink(a,1); scir(bx+bw*0.5,by-bh*0.12,sc,1); fink(a*0.4); ctx.beginPath(); ctx.arc(bx+bw*0.5,by-bh*0.12,sc*0.4,0,7); ctx.fill();
    // звуковые волны по биту
    if(beat>0.4){ ink(a*beat,0.8); for(let w=1;w<=2;w++) sarc(bx+bw*0.5,by-bh*0.12,sc+w*6,-0.9,0.9,0.8); }
  }
  function steam(x,y,col){ if(t%20===0) parts.spawn({x:x+rnd(-2,2),y:y,vy:-rnd(0.4,0.8),vx:rnd(-0.15,0.15),life:60,type:'smoke',r:2,col:col||[180,180,180]}); }
  function door(W,gy,a){ ink(a,1.6); srect(W*0.16,gy*0.18,W*0.16,gy*0.82-gy*0.18,1.5); fink(a*0.6); ctx.beginPath(); ctx.arc(W*0.30,gy*0.55,1.8,0,7); ctx.fill(); }
  function bulb(W,gy,a){ const sw=Math.sin(t*0.05)*0.12; ctx.save(); ctx.translate(W*0.5,gy*0.12); ctx.rotate(sw); ink(a,1); sl(0,0,0,gy*0.1,0.9); scir(0,gy*0.1+5,5,1); const fl=0.6+0.4*Math.sin(t*0.4)*(Math.random()>0.04?1:0.2); ctx.fillStyle=`rgba(220,200,150,${a*0.3*fl})`; ctx.beginPath(); ctx.arc(0,gy*0.1+5,16,0,7); ctx.fill(); ctx.restore(); }
  function trainCar(x,y,w2,a,lit,chug){
    ctx.save(); ctx.translate(0,chug);
    ink(a,1.5); srect(x,y-30,w2,30,1.5); ink(a,1.2); sl(x,y,x+w2,y,1.4);
    // колёса со спицами (крутятся)
    for(let wi=0;wi<2;wi++){ const cx=x+w2*(0.22+wi*0.56),cy=y+6,r=6; ink(a,1.1); scir(cx,cy,r,0.9); const an=-t*0.3; for(let k=0;k<4;k++){const aa=an+k*1.57; sl(cx,cy,cx+Math.cos(aa)*r,cy+Math.sin(aa)*r,0.7);} }
    for(let i=0;i<4;i++){ const wx=x+w2*(0.14+i*0.22); ctx.fillStyle=`rgba(210,150,70,${a*0.4*(lit||0)})`; ctx.fillRect(wx,y-24,w2*0.14,16); ink(a*0.8,0.9); srect(wx,y-24,w2*0.14,16,0.8); }
    ctx.restore();
  }

  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.84;
    dust(W,H,0.04);

    // ── A1 0.00–0.20 — попойка ───────────────────────────────────────────────
    act(p,0.00,0.20,(lp)=>{
      const sway=Math.sin(t*0.06)*0.05;
      room(W,H,gy,1); table(W,gy,0.5); candle(W,gy,0.7); boombox(W,gy,0.5);
      // поют: голова покачивается, рот открывается-закрывается (доп. дуга)
      const sing=Math.abs(Math.sin(t*0.3));
      figure(W*0.40,gy*0.78-46,{s:1,face:'happy',a:0.82,lean:sway,ph:Math.sin(t*0.1),headTilt:Math.sin(t*0.12)*0.08});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'happy',a:0.82,lean:-sway,hairFlow:Math.sin(t*0.08)*5,ph:Math.sin(t*0.1+1),headTilt:Math.sin(t*0.12+1)*0.08});
      ink(0.5,1); sarc(W*0.40,gy*0.78-71,2.5*sing+1,0.2,Math.PI-0.2,0.5); sarc(W*0.60,gy*0.78-71,2.5*sing+1,0.2,Math.PI-0.2,0.5);
      // бутылки чокаются + пар
      const clink=Math.sin(t*0.16);
      drawBottle(W*0.46+clink*6,gy*0.78-30,0.85,0.6,clink*0.35); drawBottle(W*0.54-clink*6,gy*0.78-30,0.85,0.6,-clink*0.35);
      steam(W*0.46,gy*0.78-52,WARM); steam(W*0.54,gy*0.78-52,WARM);
      if(Math.abs(clink)>0.96) for(let i=0;i<4;i++) parts.spawn({x:W*0.5,y:gy*0.78-34,vx:rnd(-1.5,1.5),vy:-rnd(0.5,1.6),g:0.04,life:34,type:'star',r:1.6,col:WARM});
      if(t%12===0) parts.spawn({x:W*0.5+rnd(-70,70),y:gy*0.78-54,vy:-rnd(0.5,1.2),vx:rnd(-0.4,0.4),life:100,type:'note',txt:(t%24?'♪':'♫'),r:rnd(2.5,4),col:C});
      caption('было круто, мы сидели, пели песни',W,H,0.45);
    });

    // ── A2 0.18–0.30 — перелом ───────────────────────────────────────────────
    act(p,0.18,0.30,(lp)=>{
      room(W,H,gy,1-lp); table(W,gy,0.5); candle(W,gy,0.7*(1-lp*0.5)); boombox(W,gy,0.5*(1-lp*0.4));
      figure(W*0.40,gy*0.78-46,{s:1,face:(lp<0.5?'happy':'flat'),a:0.8,lean:Math.sin(t*0.1)*0.03});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'flat',a:0.8,lean:lp*0.2,hairFlow:Math.sin(t*0.12)*6});
      // ноты падают, тускнеют
      if(t%12===0) parts.spawn({x:W*0.5+rnd(-80,80),y:gy*0.78-60,vy:rnd(0.5,1.3),vx:rnd(-0.2,0.2),g:0.02,life:95,type:'note',txt:'♪',r:rnd(2,3.5),col:[120,90,90]});
      // тень удлиняется
      ink(0.12*lp,1); sl(W*0.60,gy,W*0.60+W*0.1*lp,gy,6);
      caption('говорили, как же нам прикольно вместе…',W,H,0.42);
    });

    // ── A3 0.28–0.42 — удар головой ──────────────────────────────────────────
    act(p,0.28,0.42,(lp)=>{
      door(W,gy,0.6); ground(W,H,gy,0.25);
      figure(W*0.6,gy*0.78-46,{s:1,face:'shock',a:0.75,lean:Math.sin(t*0.5)*0.03});
      const stumble=Math.min(1,lp/0.45), fall=Math.max(0,(lp-0.45)/0.55);
      ctx.save(); ctx.translate(W*(0.5-0.18*stumble)-0.06*fall*W,gy*0.78-46+EZ.in(fall)*40); ctx.rotate(fall*1.45);
      figure(0,0,{s:1,fem:true,face:(fall>0.6?'x':'shock'),a:0.78,hairFlow:fall*10}); ctx.restore();
      if(fall>0.62 && _hit<0){ _hit=t; rings.length=0; cracks.length=0;
        for(let k=0;k<3;k++) rings.push({age:-k*5});
        for(let c=0;c<7;c++){const a=rnd(0,6.28),l=rnd(30,90); cracks.push({a,l});} }
      if(_hit>0){
        const dt=t-_hit;
        if(dt<3){ flash(0.5,`rgba(150,52,52,0.5)`); camShake(6); }
        else if(dt<10) camShake(3*(1-dt/10));
        // расходящиеся кольца
        rings.forEach(r=>{ r.age++; if(r.age>0&&r.age<40){ const rr=r.age*4; ink(Math.max(0,0.6-r.age*0.015),1.4); scir(W*0.30,gy*0.78-22,rr,1.2);} });
        // трещины
        cracks.forEach(c=>{ const k=Math.min(1,dt/12); red(0.5*(1-dt*0.01),1.2); sl(W*0.30,gy*0.78-22,W*0.30+Math.cos(c.a)*c.l*k,gy*0.78-22+Math.sin(c.a)*c.l*k,1); });
        if(dt<2) for(let i=0;i<12;i++) parts.spawn({x:W*0.30,y:gy*0.78-20,vx:rnd(-5,5),vy:-rnd(1,5),g:0.12,life:55,type:'star',r:rnd(2,4.5),col:C});
      }
      if(fall>0.5 && _shatter<0) _shatter=t;
      if(_shatter>0 && t-_shatter<2) for(let i=0;i<10;i++) parts.spawn({x:W*0.5,y:gy*0.78,vx:rnd(-3.5,3.5),vy:-rnd(0.5,2.5),g:0.15,life:50,type:'shard',r:rnd(2,4),col:[120,120,130]});
      caption('ты уебалась головой и не открываешь глаза',W,H,0.5);
    });

    // ── A4 0.42–0.56 — семья-стена ───────────────────────────────────────────
    act(p,0.42,0.56,(lp)=>{
      ground(W,H,gy,0.22);
      const stomp=Math.abs(Math.sin(t*0.35))*4;   // топот
      figure(W*(0.26-0.04*lp),gy*0.78-44,{s:0.9,face:'sad',a:0.7,lean:-0.05-Math.sin(t*0.2)*0.03});
      const adv=EZ.out(lp);
      figure(W*(0.92-0.12*adv),gy*0.78-44-stomp*0.4,{s:0.92,face:'angry',a:0.7,flip:true,ph:t*0.3});
      figure(W*(0.80-0.12*adv),gy*0.78-44-Math.abs(Math.sin(t*0.35+1))*3,{s:0.92,fem:true,face:'angry',a:0.7,flip:true});
      figure(W*(0.66-0.12*adv),gy*0.78-50-stomp,{s:1.12,face:'angry',a:0.78,raiseR:0.4+Math.sin(t*0.2)*0.15,flip:true});
      drawKnife(W*(0.60-0.12*adv),gy*0.78-58,0.7,-0.5+Math.sin(t*0.2)*0.15,0.5+0.4*Math.abs(Math.sin(t*0.2)));
      // парящие ценники «по частям»
      if(t%26===0) parts.spawn({x:W*(0.6-0.12*adv)+rnd(-20,20),y:gy*0.5,vy:-rnd(0.3,0.7),life:90,type:'note',txt:'₽',r:3,col:[120,100,40]});
      red(0.4+0.25*Math.sin(t*0.3),1.2); for(let i=0;i<3;i++){const yy=gy*0.4+i*8; sl(W*0.5,yy,W*0.6,yy,1);}
      if(stomp>3.6) camShake(1.2);
      caption('имя ненавидит вся семья, брат продаст по частям',W,H,0.46);
    });

    // ── A5 0.56–0.66 — флешбэк ───────────────────────────────────────────────
    act(p,0.56,0.66,(lp)=>{
      ctx.globalAlpha*=0.6+0.2*EZ.pulse((t%30)/30);
      door(W,gy,0.35); ground(W,H,gy,0.18);
      // скан-линии «памяти»
      ink(0.06,0.6); for(let y=0;y<gy;y+=4) sl(0,y+(t%4),W,y+(t%4),0.5);
      // три призрака падения со сдвигом фаз
      for(let g=0;g<3;g++){ const loop=((t+g*13)%40)/40; ctx.save(); ctx.globalAlpha*=(0.5-g*0.13); ctx.translate(W*0.34,gy*0.78-46+EZ.in(loop)*40); ctx.rotate(loop*1.4); figure(0,0,{s:0.95,fem:true,face:'x',a:0.5,hairFlow:loop*8}); ctx.restore(); }
      if((t%40)<2) for(let i=0;i<6;i++) parts.spawn({x:W*0.30,y:gy*0.78-20,vx:rnd(-3,3),vy:-rnd(1,3),life:42,type:'star',r:2,col:[120,90,90]});
      caption('а я не могу забыть, как ты об дверь убилась',W,H,0.5);
    });

    // ── A6 0.66–0.78 — пустота ───────────────────────────────────────────────
    act(p,0.66,0.78,(lp)=>{
      room(W,H,gy,0.18); table(W,gy,0.4); bulb(W,gy,0.6);
      figure(W*0.40,gy*0.78-30,{s:0.95,face:'sad',a:0.7,sit:true,headTilt:0.12+Math.sin(t*0.03)*0.03});
      ink(0.3,1); sl(W*0.60,gy*0.78,W*0.60,gy,1); sl(W*0.56,gy*0.78,W*0.64,gy*0.78,1);
      drawBottle(W*0.5,gy*0.78-30,0.85,0.45,Math.sin(t*0.03)*0.05);
      // капля со стола
      if(t%70<2) parts.spawn({x:W*0.5,y:gy*0.78,vy:rnd(0.8,1.2),g:0.05,life:50,type:'drop',r:1.6,col:[120,90,90]});
      const ny=gy*0.78-50-Math.max(0,Math.sin(t*0.04))*40;
      txt('♪',W*0.5,ny,16,0.4,'rgba(120,90,90,0.5)');
      caption('с кем теперь мне слушать песни?',W,H,0.46);
    });

    // ── A7 0.78–0.90 — поезд уезжает ─────────────────────────────────────────
    act(p,0.78,0.90,(lp)=>{
      const off=lp*W*0.6, off2=lp*W*1.1;
      // дальний слой города
      for(let i=0;i<5;i++){ const bx=((i*W*0.30 - off)%(W*1.5)+W*1.5)%(W*1.5)-W*0.15; bldg(bx,gy*0.34,W*0.16,gy*0.86,0.16,5); }
      drawMoon(W*0.84,gy*0.16,15,0.4);
      // ближний слой: фонари и провода проезжают
      ground(W,H,gy,0.2); ink(0.3,1); sl(0,gy*0.9,W,gy*0.9,1);
      for(let i=0;i<4;i++){ const lx=((i*W*0.34 - off2)%(W*1.4)+W*1.4)%(W*1.4)-W*0.1; ink(0.3,1.2); sl(lx,gy*0.9,lx,gy*0.5,1.1); sl(lx,gy*0.5,lx+10,gy*0.5,1); sarc(lx-30,gy*0.5,30,-0.5,0,0.8); }
      const chug=Math.sin(t*0.4)*1.6;
      const carX=W*0.20+EZ.out(Math.min(1,lp*1.4))*W*0.12;
      trainCar(carX,gy*0.86,W*0.5,0.7,1,chug);
      figure(carX+W*0.12,gy*0.86-44+chug,{s:0.5,face:'sad',a:0.7});
      // дым клубами по «биту» хода
      if(t%8===0) parts.spawn({x:carX-6,y:gy*0.86-30,vy:-rnd(0.5,1.1),vx:-rnd(0.4,0.9),life:75,type:'smoke',r:rnd(2,4),col:[120,120,120]});
      caption('я съезжаю в другой город…',W,H,0.46);
    });

    // ── A8 0.88–1.00 — мама вдали ────────────────────────────────────────────
    act(p,0.88,1.00,(lp)=>{
      ground(W,H,gy,0.18);
      rain(W,H,0.16,3);
      const mamaY=gy*0.78-30;
      figure(W*(0.72+0.06*lp),mamaY,{s:0.5+0.1*(1-lp),fem:true,a:0.42*(1-lp*0.4),face:'sad',raiseR:0.6+Math.sin(t*0.18)*0.25});
      figure(W*0.30,gy*0.78-44,{s:0.95,face:'cry',a:0.72,headTilt:Math.sin(t*0.04)*0.04});
      ctx.fillStyle=`rgba(210,150,70,${0.18*(1-lp*0.5)})`; ctx.beginPath(); ctx.arc(W*0.74,mamaY-30,18+Math.sin(t*0.1)*2,0,7); ctx.fill();
      // запотевание/дыхание на стекле
      const fog=0.05+0.04*Math.sin(t*0.08); ctx.fillStyle=`rgba(200,200,210,${fog})`; ctx.beginPath(); ctx.ellipse(W*0.30,gy*0.5,40,55,0,0,7); ctx.fill();
      // рамка окна поезда
      ink(0.4,2); srect(W*0.06,gy*0.12,W*0.88,gy*0.78,1.8); sl(W*0.5,gy*0.12,W*0.5,gy*0.9,1.2);
      // капли стекают по стеклу с трейлом
      ink(0.35,1); gdrops.forEach(d=>{ d.y+=d.v; if(d.y>1){d.y=-0.05;d.x=rnd(0.08,0.92);} const x=W*(0.06+d.x*0.88),y=gy*0.12+d.y*gy*0.78; sl(x,y,x,y-d.len,d.w); fink(0.4); ctx.beginPath(); ctx.arc(x,y,d.w,0,7); ctx.fill(); });
      writeOn('мама, я люблю тебя',W*0.5,gy*0.34,Math.min(30,W*0.07),EZ.out(lp),0.78,'rgba(150,52,52,0.82)');
      if(t%26===0) parts.spawn({x:W*0.30,y:gy*0.78-40,vy:rnd(0.8,1.4),life:50,type:'drop',r:2,col:[60,90,170]});
    });

    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
