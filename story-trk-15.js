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
