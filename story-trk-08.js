// ════════════════════════════════════════════════════════════════════════════
// T8 — Ты уебалась головой  (ЭТАЛОН: очень подробная, 8-актная анимация)
// Арка: тёплая попойка → удар у двери → семья-стена → флешбэк → пустота →
//       поезд уезжает → мама вдали «мама, я люблю тебя».
// Палитра: запёкшийся красный [150,52,52]; тёплая свеча в начале → холод в конце.
// ════════════════════════════════════════════════════════════════════════════
function head(){
  let t=0; _pg=-1;
  const parts=mkParts(220);   // ноты, звёзды-удар, осколки, дождь
  const C=[150,52,52];
  const WARM=[210,150,70];
  const rain=mkRain(46);
  let _hit=-1, _shatter=-1;   // одношотовые триггеры (по кадру t)

  // — локальные «декорации» —
  function room(W,H,gy,warm){
    // задняя стена + окно
    ink(0.30,1.2); sl(0,gy*0.62,W,gy*0.62,1);
    windowFrame(W*0.66,gy*0.16,W*0.2,gy*0.32,0.32);
    if(warm>0){ // тёплый свет из окна
      ctx.fillStyle=`rgba(210,150,70,${0.06*warm})`; ctx.fillRect(W*0.66,gy*0.16,W*0.2,gy*0.32);
    }
    ground(W,H,gy,0.25);
  }
  function table(W,gy,a){
    ink(a,1.4); sl(W*0.36,gy*0.78,W*0.64,gy*0.78,1.5);
    sl(W*0.40,gy*0.78,W*0.40,gy,1.2); sl(W*0.60,gy*0.78,W*0.60,gy,1.2);
  }
  function candle(W,gy,a){
    const fl=Math.sin(t*0.3)*0.4+Math.sin(t*0.17)*0.2;
    ink(a,1); sl(W*0.49,gy*0.78,W*0.49,gy*0.72,1); sl(W*0.51,gy*0.78,W*0.51,gy*0.72,1); sl(W*0.49,gy*0.78,W*0.51,gy*0.78,1);
    ctx.fillStyle=`rgba(230,160,60,${a*0.85})`; ctx.beginPath();
    ctx.ellipse(W*0.5+ww(0.8),gy*0.72-7,2.6*(1+fl*0.3),5.2*(1+fl*0.2),0,0,7); ctx.fill();
    ctx.fillStyle=`rgba(255,210,120,${a*0.5})`; ctx.beginPath(); ctx.arc(W*0.5,gy*0.72-7,1.4,0,7); ctx.fill();
  }
  function door(W,gy,a){
    ink(a,1.6); srect(W*0.16,gy*0.18,W*0.16,gy*0.82-gy*0.18,1.5);
    fink(a*0.6); ctx.beginPath(); ctx.arc(W*0.30,gy*0.55,1.8,0,7); ctx.fill(); // ручка
  }
  function trainCar(x,y,w2,a,lit){
    ink(a,1.5); srect(x,y-30,w2,30,1.5);
    ink(a,1.2); sl(x,y,x+w2,y,1.4);
    scir(x+w2*0.22,y+6,6,1.1); scir(x+w2*0.78,y+6,6,1.1);
    for(let i=0;i<4;i++){ const wx=x+w2*(0.14+i*0.22);
      ctx.fillStyle=`rgba(210,150,70,${a*0.4*(lit||0)})`; ctx.fillRect(wx,y-24,w2*0.14,16);
      ink(a*0.8,0.9); srect(wx,y-24,w2*0.14,16,0.8); }
  }

  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.84;
    dust(W,H,0.04);

    // ── A1 0.00–0.20 — тёплая попойка, поют, чокаются ───────────────────────
    act(p,0.00,0.20,(lp)=>{
      const warm=1, sway=Math.sin(t*0.06)*0.05;
      room(W,H,gy,warm); table(W,gy,0.5); candle(W,gy,0.7);
      figure(W*0.40,gy*0.78-46,{s:1,face:'happy',a:0.82,lean:sway,ph:Math.sin(t*0.1)});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'happy',a:0.82,lean:-sway,hairFlow:Math.sin(t*0.08)*4,ph:Math.sin(t*0.1+1)});
      // бутылка качается между ними, «чокаются» каждые ~1.3с
      const clink=Math.sin(t*0.16);
      drawBottle(W*0.46+clink*6,gy*0.78-30,0.85,0.6,clink*0.35);
      drawBottle(W*0.54-clink*6,gy*0.78-30,0.85,0.6,-clink*0.35);
      if(Math.abs(clink)>0.96){ for(let i=0;i<3;i++) parts.spawn({x:W*0.5,y:gy*0.78-34,vx:rnd(-1,1),vy:-rnd(0.5,1.4),life:34,type:'star',r:1.6,col:WARM}); }
      // ноты летят ВВЕРХ — музыка
      if(t%18===0) parts.spawn({x:W*0.5+rnd(-60,60),y:gy*0.78-54,vy:-rnd(0.5,1.1),vx:rnd(-0.3,0.3),life:95,type:'note',txt:(t%36?'♪':'♫'),r:rnd(2.5,4),col:C});
      caption('было круто, мы сидели, пели песни',W,H,0.45);
    });

    // ── A2 0.18–0.30 — перелом: ноты падают, веселье гаснет ──────────────────
    act(p,0.18,0.30,(lp)=>{
      room(W,H,gy,1-lp); table(W,gy,0.5); candle(W,gy,0.7*(1-lp*0.5));
      figure(W*0.40,gy*0.78-46,{s:1,face:(lp<0.5?'happy':'flat'),a:0.8});
      figure(W*0.60,gy*0.78-46,{s:1,fem:true,face:'flat',a:0.8,lean:lp*0.18,hairFlow:Math.sin(t*0.12)*5});
      // ноты теперь ПАДАЮТ
      if(t%14===0) parts.spawn({x:W*0.5+rnd(-70,70),y:gy*0.78-60,vy:rnd(0.6,1.4),vx:rnd(-0.2,0.2),g:0.02,life:90,type:'note',txt:'♪',r:rnd(2,3.5),col:[120,90,90]});
      caption('говорили, как же нам прикольно вместе…',W,H,0.42);
    });

    // ── A3 0.28–0.42 — падение, удар головой об дверь ────────────────────────
    act(p,0.28,0.42,(lp)=>{
      door(W,gy,0.6); ground(W,H,gy,0.25);
      // парень слева застывает в шоке
      figure(W*0.6,gy*0.78-46,{s:1,face:'shock',a:0.75});
      // она: стумбл (0–0.45) → падение к двери (0.45–1)
      const stumble=Math.min(1,lp/0.45), fall=Math.max(0,(lp-0.45)/0.55);
      const fx=W*(0.5-0.18*stumble)-0.06*fall*W, fyo=-EZ.in(fall)*0; // к двери влево
      ctx.save(); ctx.translate(fx,gy*0.78-46+EZ.in(fall)*40); ctx.rotate(fall*1.45);
      figure(0,0,{s:1,fem:true,face:(fall>0.6?'x':'shock'),a:0.78,hairFlow:fall*8}); ctx.restore();
      // момент удара
      if(fall>0.62 && _hit<0){ _hit=t; }
      if(_hit>0){
        const k=Math.min(1,(t-_hit)/10);
        if(t-_hit<3){ flash(0.5*(1-k),`rgba(150,52,52,${0.5*(1-k)})`); camShake(5*(1-k)); }
        if(t-_hit<2){ for(let i=0;i<10;i++) parts.spawn({x:W*0.30,y:gy*0.78-20,vx:rnd(-4,4),vy:-rnd(1,4),g:0.12,life:50,type:'star',r:rnd(2,4),col:C}); }
        // удар-линии у двери
        ink(0.6*(1-k),1.4); for(let i=0;i<6;i++){ const a=i/6*6.28; sl(W*0.30,gy*0.78-22,W*0.30+Math.cos(a)*(14+10*k),gy*0.78-22+Math.sin(a)*(14+10*k),1); }
      }
      // бутылка падает и бьётся
      if(fall>0.5 && _shatter<0){ _shatter=t; }
      if(_shatter>0 && t-_shatter<2){ for(let i=0;i<8;i++) parts.spawn({x:W*0.5,y:gy*0.78,vx:rnd(-3,3),vy:-rnd(0.5,2),g:0.14,life:46,type:'shard',r:rnd(2,4),col:[120,120,130]}); }
      caption('ты уебалась головой и не открываешь глаза',W,H,0.5);
    });

    // ── A4 0.42–0.56 — семья-стена, брат угрожает ────────────────────────────
    act(p,0.42,0.56,(lp)=>{
      ground(W,H,gy,0.22);
      // он маленький, отступает влево
      figure(W*(0.26-0.04*lp),gy*0.78-44,{s:0.9,face:'sad',a:0.7,lean:-0.05});
      // стена из трёх злых фигур наступает справа
      const adv=EZ.out(lp);
      figure(W*(0.92-0.12*adv),gy*0.78-44,{s:0.92,face:'angry',a:0.7,flip:true});
      figure(W*(0.80-0.12*adv),gy*0.78-44,{s:0.92,fem:true,face:'angry',a:0.7,flip:true});
      // брат — крупнее, с занесённой рукой
      figure(W*(0.66-0.12*adv),gy*0.78-50,{s:1.12,face:'angry',a:0.78,raiseR:0.5,flip:true});
      // блик ножа у брата
      drawKnife(W*(0.60-0.12*adv),gy*0.78-58,0.7,-0.5+Math.sin(t*0.1)*0.1,0.5);
      // злые каракули-крик
      red(0.4+0.2*Math.sin(t*0.3),1.2); for(let i=0;i<3;i++){ const yy=gy*0.4+i*8; sl(W*0.5,yy,W*0.6,yy,1); }
      caption('твоё имя ненавидит вся твоя семья, брат продаст по частям',W,H,0.46);
    });

    // ── A5 0.56–0.66 — флешбэк удара (память, обесцвеченный повтор) ───────────
    act(p,0.56,0.66,(lp)=>{
      ctx.globalAlpha*=0.6+0.2*EZ.pulse((t%30)/30);
      door(W,gy,0.35); ground(W,H,gy,0.18);
      // призрачный повтор падения, по кругу
      const loop=(t%40)/40;
      ctx.save(); ctx.translate(W*0.34,gy*0.78-46+EZ.in(loop)*40); ctx.rotate(loop*1.4);
      figure(0,0,{s:0.95,fem:true,face:'x',a:0.45,hairFlow:loop*8}); ctx.restore();
      if(loop<0.1) for(let i=0;i<5;i++) parts.spawn({x:W*0.30,y:gy*0.78-20,vx:rnd(-3,3),vy:-rnd(1,3),life:40,type:'star',r:2,col:[120,90,90]});
      caption('а я не могу забыть, как ты об дверь убилась',W,H,0.5);
    });

    // ── A6 0.66–0.78 — пустая комната, «с кем теперь слушать песни» ───────────
    act(p,0.66,0.78,(lp)=>{
      room(W,H,gy,0.2); table(W,gy,0.4);
      // один стул пуст, он сидит сгорбившись
      figure(W*0.40,gy*0.78-30,{s:0.95,face:'sad',a:0.7,sit:true,headTilt:0.12});
      ink(0.3,1); sl(W*0.60,gy*0.78,W*0.60,gy,1); sl(W*0.56,gy*0.78,W*0.64,gy*0.78,1); // пустой стул-силуэт
      drawBottle(W*0.5,gy*0.78-30,0.85,0.45,Math.sin(t*0.03)*0.05); // одна бутылка
      // одинокая нота пытается взлететь и падает
      const ny=gy*0.78-50-Math.max(0,Math.sin(t*0.04))*40;
      txt('♪',W*0.5,ny,16,0.4,'rgba(120,90,90,0.5)');
      caption('с кем теперь мне слушать песни?',W,H,0.46);
    });

    // ── A7 0.78–0.90 — поезд уезжает из города ───────────────────────────────
    act(p,0.78,0.90,(lp)=>{
      // скролл города назад
      const off=lp*W*0.6;
      for(let i=0;i<5;i++){ const bx=((i*W*0.26 - off)%(W*1.3)+W*1.3)%(W*1.3)-W*0.15; bldg(bx,gy*0.3,W*0.16,gy*0.86,0.22,5); }
      drawMoon(W*0.84,gy*0.16,15,0.4);
      ground(W,H,gy,0.2); ink(0.3,1); sl(0,gy*0.9,W,gy*0.9,1); // рельс
      // вагон въезжает и стоит по центру, парень в окне
      const carX=W*0.20+EZ.out(Math.min(1,lp*1.4))*W*0.12;
      trainCar(carX,gy*0.86,W*0.5,0.7,1);
      figure(carX+W*0.12,gy*0.86-44,{s:0.5,face:'sad',a:0.7}); // в окне, смотрит назад
      // дымок
      if(t%16===0) parts.spawn({x:carX-6,y:gy*0.86-30,vy:-rnd(0.4,0.9),vx:-0.5,life:70,type:'smoke',r:3,col:[120,120,120]});
      caption('я съезжаю в другой город…',W,H,0.46);
    });

    // ── A8 0.88–1.00 — мама вдали, «мама, я люблю тебя» (момент слёз) ─────────
    act(p,0.88,1.00,(lp)=>{
      // вид сквозь окно поезда: рамка + дождь по стеклу
      ground(W,H,gy,0.18);
      rain(W,H,0.18,3);
      // вдали — маленький силуэт мамы, машет
      const mamaY=gy*0.78-30;
      figure(W*(0.72+0.06*lp),mamaY,{s:0.5+0.1*(1-lp),fem:true,a:0.4*(1-lp*0.4),face:'sad',raiseR:0.6+Math.sin(t*0.15)*0.2});
      // он у стекла слева
      figure(W*0.30,gy*0.78-44,{s:0.95,face:'cry',a:0.72});
      // тёплый огонёк-воспоминание над мамой
      ctx.fillStyle=`rgba(210,150,70,${0.18*(1-lp*0.5)})`; ctx.beginPath(); ctx.arc(W*0.74,mamaY-30,18,0,7); ctx.fill();
      // рамка окна поезда поверх
      ink(0.4,2); srect(W*0.06,gy*0.12,W*0.88,gy*0.78,1.8); sl(W*0.5,gy*0.12,W*0.5,gy*0.9,1.2);
      // рукописная строка проявляется
      writeOn('мама, я люблю тебя',W*0.5,gy*0.34,Math.min(30,W*0.07),EZ.out(lp),0.75,'rgba(150,52,52,0.8)');
      if(t%30===0) parts.spawn({x:W*0.30,y:gy*0.78-40,vy:rnd(0.8,1.4),life:50,type:'drop',r:2,col:[60,90,170]});
    });

    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
