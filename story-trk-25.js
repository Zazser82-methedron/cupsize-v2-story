// T25 — Все мои поступки
// посмотри в глаза (пустота) → обоссал подъезд, злые сообщения → петарды в спальне → конченые, глитч
function chaos(){
  let t=0; _pg=-1;
  const parts=mkParts(150);
  const C=[140,30,30];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        // огромное лицо, пустые глаза
        ink(0.5,1.6); scir(W*0.5,H*0.42,W*0.22,2.2);
        const ey=H*0.4;
        ink(0.6,1.6); scir(W*0.42,ey,W*0.04,1.6); scir(W*0.58,ey,W*0.04,1.6);
        // пустота внутри — воронка
        const g=ctx.createRadialGradient(W*0.42,ey,1,W*0.42,ey,W*0.04); g.addColorStop(0,'rgba(16,10,10,0.6)'); g.addColorStop(1,'rgba(16,10,10,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W*0.42,ey,W*0.04,0,7); ctx.fill();
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W*0.58,ey,W*0.04,0,7); ctx.fill();
        caption('посмотри в мои глаза — ничего никогда',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // подъезд
        ink(0.4,1.3); srect(W*0.3,H*0.2,W*0.4,gy-H*0.2,1.2);
        figure(W*0.5,gy-46,{s:0.95,face:'angry',a:0.65});
        if(t%14===0) parts.spawn({x:W*0.5,y:gy-20,vy:rnd(0.8,1.6),vx:rnd(-0.3,0.3),life:40,type:'drop',r:2,col:[150,120,40]});
        caption('я в который раз обоссал подъезд',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.4,1.3); srect(W*0.2,H*0.2,W*0.6,gy-H*0.2,1.2); // спальня
        figure(W*0.5,gy-44,{s:0.9,a:0.6,face:'angry'});
        // петарды
        if(t%5===0) for(let i=0;i<3;i++) parts.spawn({x:rnd(W*0.25,W*0.75),y:rnd(H*0.3,gy-20),vx:rnd(-4,4),vy:rnd(-4,4),life:30,type:'shard',r:rnd(2,5),col:C});
        if(AUD.beat>0.4) camShake(3);
        caption('взрывая петарды в нашей уютной спальне',W,H,0.5);
      },
      (lp)=>{
        // глитч-хаос
        for(let i=0;i<6;i++){ const yy=rnd(0,H); ctx.fillStyle=`rgba(${rnd(120,200)|0},30,30,0.12)`; ctx.fillRect(0,yy,W,rnd(2,10)); }
        ctx.globalAlpha=0.6+0.3*EZ.pulse((t%20)/20);
        txt('все мои поступки',W*0.5,H*0.4,Math.min(34,W*0.08),0.7,'rgba(140,30,30,0.7)');
        txt('конченые',W*0.5+ww(4),H*0.52,Math.min(40,W*0.09),0.7,'rgba(140,30,30,0.75)');
        ctx.globalAlpha=1;
        if(t%6===0) parts.spawn({x:rnd(0,W),y:rnd(0,H),vx:rnd(-3,3),vy:rnd(-3,3),life:24,type:'dot',r:rnd(1,3),col:C});
        caption('все мои поступки — конченые',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.22); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
