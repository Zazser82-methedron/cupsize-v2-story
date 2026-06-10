// T6 — Следак
// девочка на качелях → тень взрослого зовёт → пустые качели, конфета, дождь → найдись
function detective(){
  let t=0; _pg=-1;
  const rain=mkRain(40);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        drawSun(W*0.82,H*0.18,16,0.35);
        ground(W,H,gy,0.25);
        bldg(W*0.05,H*0.18,W*0.22,gy,0.25,5);
        drawSwing(W*0.5,H*0.32,H*0.34,Math.sin(t*0.04)*0.26,0.5);
        figure(W*0.5,H*0.32+H*0.27,{s:0.7,fem:true,face:'happy',a:0.7,lean:Math.sin(t*0.04)*0.26});
        caption('ты качалась во дворе',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        drawSwing(W*0.32,H*0.32,H*0.34,Math.sin(t*0.05)*0.1,0.45);
        figure(W*0.32,H*0.32+H*0.27,{s:0.7,fem:true,face:'sad',a:0.6});
        ctx.save(); ctx.globalAlpha=0.5+lp*0.3;
        figure(W*0.66,gy-50,{s:1.2,a:0.65,face:'flat',raiseL:0.4});
        ctx.restore();
        caption('пока взрослый дядька не позвал к себе',W,H,0.45);
      },
      (lp)=>{
        rain(W,H,0.25,2);
        ground(W,H,gy,0.2);
        for(let i=0;i<3;i++) cloud(W*(0.25+i*0.25),H*0.16,16,0.3);
        drawSwing(W*0.5,H*0.32,H*0.34,Math.sin(t*0.02)*0.05,0.4);
        fred(0.5); ctx.beginPath(); ctx.ellipse(W*0.5,gy-4,6,4,0,0,7); ctx.fill();
        ink(0.4,0.8); sl(W*0.47,gy-4,W*0.44,gy-6,0.7); sl(W*0.53,gy-4,W*0.56,gy-6,0.7);
        caption('тучи собрались во дворе и стали плакать',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.5,1.4); srect(W*0.38,H*0.22,W*0.24,H*0.34,1.4);
        scir(W*0.5,H*0.33,W*0.05,1.6);
        txt('?',W*0.5,H*0.355,W*0.06,0.6);
        txt('найдись',W*0.5,H*0.52,Math.min(22,W*0.05),0.6,'rgba(74,106,122,0.75)');
        const lx=W*0.72+Math.sin(t*0.03)*18,ly=H*0.42+Math.cos(t*0.04)*12;
        ink(0.5,1.6); scir(lx,ly,15,1.8); sl(lx+10,ly+10,lx+22,ly+22,2);
        caption('мы очень ждём тебя, найдись',W,H,0.5);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
