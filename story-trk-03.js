// T3 — Вся моя жизнь говно
// ссора с тёлкой → купаться в дерьме (но мне хорошо) → двор, собаки → Сатана сводный брат
function trash(){
  let t=0; _pg=-1;
  const parts=mkParts(120);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.25);
        figure(W*0.36,gy-46,{s:1,face:'angry',a:0.78,raiseR:lp*0.5});
        figure(W*0.64,gy-46,{s:1,fem:true,face:'sad',a:0.7,lean:lp*0.1,hairFlow:Math.sin(t*0.1)*4});
        if(t%30<15) txt('тупая',W*0.36,H*0.32,18,0.5,'rgba(150,52,52,0.55)');
        caption('расстанется со мной, если не перестану…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const r=W*0.3;
        const g=ctx.createRadialGradient(W*0.5,gy,4,W*0.5,gy,r);
        g.addColorStop(0,'rgba(110,72,30,0.5)'); g.addColorStop(1,'rgba(110,72,30,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(W*0.5,gy,r,r*0.3,0,0,7); ctx.fill();
        figure(W*0.5,gy-20,{s:1,face:'happy',a:0.8,ph:Math.sin(t*0.06)});
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy,vy:-rnd(0.6,1.4),life:70,type:'smoke',r:3,col:[110,72,30]});
        caption('вся моя жизнь — говно, но мне хорошо',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.22);
        bldg(W*0.05,H*0.2,W*0.25,gy,0.3,4);
        figure(W*0.45,gy-46,{s:1,face:'angry',a:0.7,raiseR:0.4});
        drawDog(W*0.62,gy-10,1,0.5,(Math.sin(t*0.2)>0));
        caption('я пинал собак с надеждой…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-58,{s:1.25,face:'flat',a:0.7});
        const sx=W*0.66,sy=gy-46;
        figure(sx,sy,{s:1,a:0.6,face:'angry'});
        red(0.6,1.6); sl(sx-7,sy-38,sx-11,sy-48,1.3); sl(sx+7,sy-38,sx+11,sy-48,1.3);
        star5(W*0.66,H*0.25,16,0.5*EZ.pulse((t%90)/90)+0.3);
        caption('Сатана — мой сводный брат',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
