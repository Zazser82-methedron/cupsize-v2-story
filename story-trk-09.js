// T9 — Первокурсница
// девушка у окна, кто-то смотрит → одна, как взаперти → мужчины, что любят силой → тебя красивую
function student(){
  let t=0; _pg=-1;
  const parts=mkParts(70);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        windowFrame(W*0.34,H*0.22,W*0.3,H*0.46,0.5);
        figure(W*0.49,gy-46,{s:0.95,fem:true,face:'calm',a:0.7,hairLong:-12,hairFlow:Math.sin(t*0.03)*3});
        // глаз в окне напротив
        ink(0.4,1.2); sellipse(W*0.82,H*0.3,12,6,1.2); fink(0.5); ctx.beginPath(); ctx.arc(W*0.82,H*0.3,3,0,7); ctx.fill();
        caption('кто-то смотрит на тебя из окна',W,H,0.45);
      },
      (lp)=>{
        // решётка-взаперти
        const g=ctx.createRadialGradient(W*0.5,H*0.5,4,W*0.5,H*0.5,W*0.45);
        g.addColorStop(0,'rgba(150,90,170,0.12)'); g.addColorStop(1,'rgba(20,16,30,0.3)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'sad',a:0.6});
        ink(0.3,1.2); for(let i=0;i<5;i++) sl(W*(0.3+i*0.1),H*0.12,W*(0.3+i*0.1),gy,1);
        caption('пусто одной, как взаперти',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.62,gy-46,{s:0.9,fem:true,face:'shock',a:0.6});
        // мужчина-сила: тёмный, кулак
        figure(W*0.36,gy-50,{s:1.15,a:0.7,face:'angry',raiseR:0.5});
        const fx=W*0.36+18,fy=gy-50-30*0.5;
        ink(0.7,1.6); scir(fx,fy-6,6,1.4);
        if(t%30<15){ acc(0.5,1.2); for(let i=0;i<3;i++) sl(W*0.5,H*(0.3+i*0.03),W*0.56,H*(0.3+i*0.03),1); }
        caption('тебе нравятся мужчины, что любят силой',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,fem:true,face:'calm',a:0.7,hairLong:-12,hairFlow:Math.sin(t*0.04)*4});
        if(t%24===0) parts.spawn({x:W*0.5+rnd(-50,50),y:gy-60,vy:-rnd(0.3,0.8),life:90,type:'heart',r:rnd(3,5),col:[150,90,170]});
        txt('тебя красивую',W*0.5,H*0.28,Math.min(26,W*0.06),0.5,'rgba(150,90,170,0.55)');
        caption('тебя красивую, тебя красивую',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
