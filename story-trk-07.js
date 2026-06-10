// T7 — Черновик
// пара гуляет, шарик, туча → грузовик и колесо → он держит шар, дыра в сердце → черновик, круги
function notebook(){
  let t=0; _pg=-1;
  const parts=mkParts(60);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        cloud(W*0.7,H*0.18,18,0.3+lp*0.2);
        figure(W*0.42,gy-46,{s:0.95,face:'happy',a:0.75,ph:t*0.12,step:5,swing:5});
        figure(W*0.56,gy-46,{s:0.95,fem:true,face:'happy',a:0.75,ph:t*0.12+1,step:5,swing:5,hairFlow:Math.sin(t*0.1)*4});
        balloon(W*0.5,H*0.3+Math.sin(t*0.04)*6,14,W*0.56,gy-46,0.7);
        caption('ты любила гулять на День города',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const wx=W*0.5,wy=gy-40,wr=W*0.16;
        ink(0.6,1.8); scir(wx,wy,wr,2);
        for(let i=0;i<8;i++){const a=i/8*6.28+t*0.05; sl(wx,wy,wx+Math.cos(a)*wr,wy+Math.sin(a)*wr,0.8);}
        if(lp>0.4){ fred(0.3*EZ.pulse((t%40)/40)); ctx.beginPath(); ctx.arc(wx,wy+wr,wr*0.4,0,7); ctx.fill(); }
        if(lp>0.5) balloon(W*0.78,H*0.2-lp*40,12,W*0.78,H*0.2,0.4);
        caption('тебя намотал грузовик на огромное колесо',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.45,gy-46,{s:1,face:'sad',a:0.7});
        balloon(W*0.62,H*0.28+Math.sin(t*0.03)*8,14,W*0.45,gy-44,0.6);
        drawHeart(W*0.45,gy-30,8,0.45,[176,60,40]);
        ink(0.6,1.4); scir(W*0.45,gy-30,3.5,1.2);
        caption('в моём сердце дыра…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.2,0.7); for(let i=1;i<8;i++) sl(W*0.2,H*0.15+i*H*0.08,W*0.8,H*0.15+i*H*0.08,0.5);
        red(0.3,1); sl(W*0.26,H*0.1,W*0.26,gy,1);
        txt('черновик',W*0.5,H*0.42,Math.min(40,W*0.1),0.6,'rgba(176,60,40,0.6)');
        const cx=W*0.5+Math.cos(t*0.04)*W*0.16, cyy=gy-30+Math.sin(t*0.04)*10;
        figure(cx,cyy,{s:0.7,face:'flat',a:0.5,ph:t*0.2,step:5,swing:5});
        caption('в мире чистых листов ты теперь черновик',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
