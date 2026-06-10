// T4 — Будка
// злой батя запрещает → план (батя→пёс) → пёс в наморднике в будке, соседи → травят
function doghouse(){
  let t=0; _pg=-1;
  const parts=mkParts(60);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        figure(W*0.3,gy-58,{s:1.3,face:'angry',a:0.8,raiseR:0.5});
        figure(W*0.62,gy-42,{s:0.85,fem:true,face:'sad',a:0.6});
        figure(W*0.78,gy-42,{s:0.85,face:'sad',a:0.5,flip:true});
        red(0.4,1.2); for(let i=0;i<3;i++){const y=H*(0.3+i*0.03); sl(W*0.36,y,W*0.46,y,1);}
        caption('твой батя запрещает со мной общаться',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        figure(W*0.3,gy-46,{s:1,face:'angry',a:0.7});
        ink(0.4,1.2); scir(W*0.6,H*0.32,W*0.13,2);
        ink(0.3,1); for(let i=0;i<3;i++) scir(W*0.45-i*8,H*0.45+i*6,3-i,1);
        ctx.save(); ctx.translate(W*0.6,H*0.32);
        ctx.globalAlpha=(1-lp); figure(0,14,{s:0.5,a:0.6,face:'angry'});
        ctx.globalAlpha=lp; drawDog(-6,8,0.7,0.6,false); ctx.restore();
        caption('но у меня есть свой план…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        if(Math.sin(t*0.3)>0.7) camShake(2);
        for(let i=0;i<3;i++) windowFrame(W*(0.05+i*0.07),H*0.2,W*0.05,H*0.08,0.3);
        ink(0.5,1.4); sl(W*0.4,gy,W*0.4,gy-50,1.3); sl(W*0.6,gy,W*0.6,gy-50,1.3);
        sl(W*0.38,gy-50,W*0.5,gy-70,1.3); sl(W*0.62,gy-50,W*0.5,gy-70,1.3);
        scir(W*0.5,gy-22,16,2);
        drawDog(W*0.5,gy-12,1.1,0.6,(Math.sin(t*0.25)>0.3));
        caption('скрипит будка, соседи не спят…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.5,1.4); sl(W*0.4,gy,W*0.4,gy-50,1.3); sl(W*0.6,gy,W*0.6,gy-50,1.3);
        sl(W*0.38,gy-50,W*0.5,gy-70,1.3); sl(W*0.62,gy-50,W*0.5,gy-70,1.3);
        drawDog(W*0.5,gy-12,1.1,0.4,false);
        if(lp>0.5){ red(0.6,1.4); const x=W*0.5,y=gy-30; sl(x-8,y-8,x+8,y+8,1.3); sl(x+8,y-8,x-8,y+8,1.3); }
        caption('соседи траванут его, всё получится',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
