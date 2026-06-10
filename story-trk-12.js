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
