// T22 — Неудобно
// она намекает → неудобные места (площадка, примерочная) → волосы на кулак → идеи кончились
function awkward(){
  let t=0; _pg=-1;
  const parts=mkParts(50);
  const C=[190,120,130];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'flat',a:0.7});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'calm',a:0.72,hairFlow:Math.sin(t*0.05)*4});
        ink(0.35,1.2); scir(W*0.7,H*0.3,W*0.06,1.4); txt('…',W*0.7,H*0.31,18,0.4);
        caption('ты мне намекала, что нам станет скучно',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // площадка
        drawSwing(W*0.24,H*0.34,H*0.28,Math.sin(t*0.04)*0.1,0.4);
        // примерочная — шторка
        ink(0.45,1.3); sl(W*0.55,H*0.2,W*0.8,H*0.2,1.3);
        for(let i=0;i<6;i++) sl(W*0.56+i*0.04*W,H*0.2,W*0.56+i*0.04*W,gy-20,1);
        figure(W*0.45,gy-44,{s:0.85,a:0.55,face:'flat'});
        caption('на детской площадке, в примерочной…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.42,gy-46,{s:1,face:'flat',a:0.68,raiseR:0.4});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'shock',a:0.68,headTilt:0.2,hairLong:-14,hairFlow:6});
        // волосы намотаны на кулак
        ink(0.5,1.2); for(let i=0;i<4;i++) sarc(W*0.5,gy-50,6+i*2,0,Math.PI*1.6,1);
        caption('накрутить на кулак твои волосы',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'flat',a:0.6});
        figure(W*0.6,gy-46,{s:1,fem:true,face:'sad',a:0.6});
        // пустой пузырь мысли
        ink(0.35,1.2); scir(W*0.5,H*0.26,W*0.1,1.5);
        txt('?',W*0.5,H*0.28,W*0.06,0.4);
        caption('закончились идеи, закончились идеи',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
