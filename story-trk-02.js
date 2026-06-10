// T2 — Детская травма
// солнечная площадка (один) → травля + снег → дом, папа уходит → «детская травма»
function trauma(){
  let t=0; _pg=-1;
  const snow=mkSnow(70);
  const taunts=['урод','шлюха','один','никто'];
  const parts=mkParts(80);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        drawSun(W*0.82,H*0.18,20,0.5);
        ground(W,H,gy,0.25);
        drawSwing(W*0.36,H*0.3,H*0.34,Math.sin(t*0.03)*0.18,0.4);
        figure(W*0.18,gy-44,{s:0.8,face:'sad',a:0.6,ph:Math.sin(t*0.05)});
        figure(W*0.72,gy-40,{s:0.72,a:0.32,face:'happy',flip:true});
        figure(W*0.8,gy-40,{s:0.72,a:0.32,face:'happy'});
        caption('летом солнце ярче светит…',W,H,0.4);
      },
      (lp)=>{
        snow(W,H,0.12+lp*0.1);
        ground(W,H,gy,0.22);
        figure(W*0.3,gy-44,{s:0.85,face:'sad',a:0.6,lean:Math.sin(t*0.3)*0.04});
        if(t%24===0) parts.spawn({x:W*0.72,y:rnd(H*0.2,H*0.6),vx:-rnd(1,2.4),vy:rnd(-0.4,0.4),life:90,type:'note',txt:taunts[(t/24|0)%4],r:3,col:[150,52,52]});
        caption('таких, как ты, будут гнобить',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.2);
        ground(W,H,gy,0.2);
        drawHouse(W*0.28,gy,1.3,0.5);
        windowFrame(W*0.6,H*0.4,W*0.18,H*0.2,0.45);
        figure(W*0.69,H*0.55,{s:0.55,face:'cry',a:0.6});
        const dx=W*0.5+lp*W*0.42;
        figure(dx,gy-46,{s:0.9,a:0.4*(1-lp*0.6),face:'flat',ph:t*0.2,step:6,swing:6});
        caption('ты дома снова один, никто не любит тебя',W,H,0.45);
      },
      (lp)=>{
        for(let i=0;i<4;i++) cloud(W*(0.18+i*0.22)+Math.sin(t*0.01+i)*12,H*0.2+Math.cos(t*0.008+i)*8,16+i*3,0.18);
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-44,{s:0.85,a:0.5,face:'sad'});
        ctx.globalAlpha=0.5+0.2*EZ.pulse((t%120)/120);
        txt('детская травма',W*0.5,H*0.4,Math.min(46,W*0.11),0.7,'rgba(150,52,52,0.7)');
        ctx.globalAlpha=1;
        caption('а на небе плывут облака…',W,H,0.4);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
