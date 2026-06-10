// T18 — Велосипед
// звонок, музыка играет → катит на велосипеде вдвоём → взрыв дома → психопат следит, придумал мир
function bicycle(){
  let t=0; _pg=-1;
  const parts=mkParts(120);
  const C=[60,140,90];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'happy',a:0.72,raiseR:0.5});
        drawPhone(W*0.4+20,gy-60,1,0.6,0.6+0.4*Math.sin(t*0.2));
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-30,30),y:gy-50,vy:-rnd(0.4,1),vx:rnd(-0.3,0.3),life:90,type:'note',txt:'♪',r:rnd(2,4),col:C});
        caption('моя музыка будет играть для тебя',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // едут на велосипеде
        const bx=W*0.2+lp*W*0.55;
        drawBike(bx,gy-14,1,0.7,t*0.2);
        figure(bx-2,gy-44,{s:0.7,a:0.7,face:'happy',ph:t*0.2,raiseR:0.3});
        figure(bx+12,gy-40,{s:0.6,fem:true,a:0.6,face:'happy',hairFlow:6});
        ink(0.3,0.8); for(let i=0;i<4;i++) sl(bx-26-i*10,gy-14,bx-34-i*10,gy-14,0.7);
        caption('я прокачу тебя на велосипеде',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawHouse(W*0.5,gy,1.5,0.5);
        // взрыв
        const burst=EZ.out(lp);
        if(t%3===0) for(let i=0;i<4;i++) parts.spawn({x:W*0.5+rnd(-30,30),y:gy-40,vx:rnd(-5,5)*burst,vy:-rnd(2,7)*burst,g:0.15,life:60,type:(i%2?'shard':'dot'),r:rnd(2,5),col:[210,90,40]});
        ctx.fillStyle=`rgba(210,90,40,${0.15*burst*EZ.pulse((t%30)/30)})`; ctx.beginPath(); ctx.arc(W*0.5,gy-40,W*0.2*burst,0,7); ctx.fill();
        caption('взорву свой дом, а после разделю с тобой вечер',W,H,0.5);
      },
      (lp)=>{
        // сюр: следит, придумал мир
        ground(W,H,gy,0.2);
        bldg(W*0.05,H*0.2,W*0.2,gy,0.3,4); bldg(W*0.75,H*0.2,W*0.2,gy,0.3,4);
        figure(W*0.5,gy-46,{s:0.95,a:0.6,face:'flat'});
        // глаза-слежка
        for(let i=0;i<4;i++){const x=rnd(W*0.1,W*0.9),y=rnd(H*0.15,H*0.5); ink(0.3,1); sellipse(x,y,8,4,1); fink(0.4); ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fill();}
        if(t%30===0) parts.spawn({x:W*0.5,y:H*0.2,vy:0.3,life:120,type:'star',r:3,col:C});
        caption('я этот мир придумал — это факт',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
