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
