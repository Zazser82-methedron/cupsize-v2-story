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
