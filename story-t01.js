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
