// T8 — Ты уебалась головой
// пьют, поют → падение, удар головой (X) → семья злая, поезд в другой город → один, мама вдали
function head(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        figure(W*0.4,gy-46,{s:1,face:'happy',a:0.78,ph:Math.sin(t*0.1)});
        figure(W*0.6,gy-46,{s:1,fem:true,face:'happy',a:0.78,ph:Math.sin(t*0.1+1),hairFlow:Math.sin(t*0.08)*4});
        drawBottle(W*0.5,gy-30,0.9,0.6,Math.sin(t*0.05)*0.3);
        if(t%26===0) parts.spawn({x:W*0.5+rnd(-30,30),y:gy-50,vy:-rnd(0.5,1),vx:rnd(-0.4,0.4),life:80,type:'note',txt:'♪',r:3,col:[150,52,52]});
        caption('было круто, мы пели песни',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.5,1.6); sl(W*0.62,H*0.2,W*0.62,gy,1.6); // дверь
        const fall=EZ.in(lp);
        ctx.save(); ctx.translate(W*0.5,gy-30); ctx.rotate(fall*1.4);
        figure(0,0,{s:0.95,fem:true,face:(lp>0.5?'x':'shock'),a:0.7}); ctx.restore();
        if(lp>0.45 && t%8===0) for(let i=0;i<3;i++) parts.spawn({x:W*0.5,y:gy-30,vx:rnd(-3,3),vy:-rnd(1,3),life:50,type:'star',r:rnd(2,4),col:[150,52,52]});
        caption('ты уебалась головой и не открываешь глаза',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.18,gy-44,{s:0.85,face:'angry',a:0.55});
        figure(W*0.3,gy-44,{s:0.85,face:'angry',a:0.55,flip:true});
        // поезд уезжает вправо
        const tx=W*0.4+lp*W*0.5;
        ink(0.6,1.5); srect(tx,gy-40,W*0.22,28,1.4); scir(tx+W*0.05,gy-12,7,1.2); scir(tx+W*0.16,gy-12,7,1.2);
        for(let i=0;i<3;i++) windowFrame(tx+W*0.03+i*W*0.06,gy-34,W*0.04,12,0.5);
        ink(0.3,1); sl(0,gy,W,gy,1);
        caption('я уезжаю в другой город…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-44,{s:0.95,face:'sad',a:0.65});
        // мама-силуэт вдали
        figure(W*0.78,gy-36,{s:0.7,fem:true,a:0.3*(1-lp*0.3),face:'flat'});
        ctx.globalAlpha=0.5+0.2*EZ.pulse((t%140)/140);
        txt('мама, я люблю тебя',W*0.5,H*0.3,Math.min(28,W*0.065),0.7,'rgba(150,52,52,0.7)');
        ctx.globalAlpha=1;
        caption('мама, я люблю тебя',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
