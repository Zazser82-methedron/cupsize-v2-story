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
