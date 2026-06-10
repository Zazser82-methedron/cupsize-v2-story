// T26 — Прыгай, дура! (финал)
// клуб, алкоголь, Aperol → прыгай, дура (прыжок) → бывший-опер следит → большой прыжок, конфетти
function jump(){
  let t=0; _pg=-1;
  const parts=mkParts(180);
  const C=[230,120,40];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // клуб: огни по биту
        for(let i=0;i<6;i++){ const x=W*(0.1+i*0.16); const on=Math.sin(t*0.2+i)>0; ctx.fillStyle=`rgba(230,120,40,${on?0.18:0.05})`; ctx.fillRect(x-8,H*0.12,16,10); }
        figure(W*0.42,gy-44,{s:0.95,a:0.7,face:'happy',ph:t*0.15});
        figure(W*0.58,gy-44,{s:0.95,fem:true,a:0.7,face:'happy',ph:t*0.15+1,hairFlow:6});
        drawBottle(W*0.5,gy-26,0.9,0.6,Math.sin(t*0.06)*0.3);
        caption('во мне алкоголь, все раны лечит Aperol',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // прыжок по биту
        const j=Math.abs(Math.sin(t*0.18))*40*(1+AUD.beat);
        figure(W*0.5,gy-44-j,{s:1,fem:true,face:'happy',a:0.78,raise:0.8,hairFlow:8,step:4});
        if(t%8===0) parts.spawn({x:W*0.5+rnd(-30,30),y:gy,vy:-rnd(1,2),life:40,type:'dot',r:2,col:C});
        caption('на тебе мини-юбка, прыгай, дура',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-44,{s:0.95,fem:true,a:0.7,face:'shock',hairFlow:4});
        // бывший-опер следит
        figure(W*0.7,gy-50,{s:1.1,a:0.55,face:'angry'});
        ink(0.5,1.3); scir(W*0.7-4,gy-52,3,1); scir(W*0.7+4,gy-52,3,1); // взгляд
        if(t%30<15) txt('за нами наблюдают',W*0.5,H*0.26,Math.min(20,W*0.045),0.5,'rgba(140,40,40,0.55)');
        caption('твой бывший настроен, будто бы он опер',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // большой финальный прыжок + конфетти
        const j=EZ.bounce((t%50)/50)*70;
        figure(W*0.5,gy-44-j,{s:1.05,fem:true,face:'happy',a:0.82,raise:0.9,hairFlow:10,step:5});
        if(t%3===0) for(let i=0;i<3;i++) parts.spawn({x:rnd(0,W),y:-5,vy:rnd(1,3),vx:rnd(-1,1),vr:rnd(-0.2,0.2),rot:rnd(0,6),life:120,type:(i%2?'star':'petal'),r:rnd(3,6),col:[rnd(180,240)|0,rnd(80,160)|0,rnd(40,120)|0]});
        caption('прыгай со мною, дура, до утра',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.14); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
