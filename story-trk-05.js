// T5 — Розовая могила
// Карина подводит глаза у зеркала → пустота (нет смысла) → розовая могила, гроб → корона, король
function grave(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const PINK=[214,110,150];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        ink(0.4,1.4); srect(W*0.55,H*0.2,W*0.2,H*0.4,1.3);
        figure(W*0.4,gy-46,{s:1,fem:true,face:'calm',a:0.75,hairLong:-10,hairFlow:Math.sin(t*0.04)*3});
        ctx.save(); ctx.globalAlpha=0.4; figure(W*0.65,gy-46,{s:0.9,fem:true,face:'calm',a:0.7,flip:true}); ctx.restore();
        caption('«если уходить — уходи красиво»',W,H,0.45);
      },
      (lp)=>{
        const g=ctx.createRadialGradient(W*0.5,H*0.5,4,W*0.5,H*0.5,W*0.4);
        g.addColorStop(0,'rgba(20,16,30,0.4)'); g.addColorStop(1,'rgba(20,16,30,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'sad',a:0.5});
        caption('в жизни нету никакого смысла',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        ctx.fillStyle='rgba(214,110,150,0.22)'; ctx.fillRect(W*0.38,gy-EZ.out(lp)*H*0.4,W*0.24,EZ.out(lp)*H*0.4);
        acc(0.7,1.6); srect(W*0.38,gy-H*0.4,W*0.24,H*0.4,1.5);
        txt('Карина',W*0.5,gy-H*0.3,Math.min(30,W*0.07),0.7,'rgba(214,110,150,0.85)');
        ink(0.35,1); srect(W*0.4,gy+6,W*0.2,16,1);
        caption('розовая могила, а под плитой плюшевый гроб',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        acc(0.7,1.6); srect(W*0.38,gy-H*0.4,W*0.24,H*0.4,1.5);
        const cx=W*0.5,cy=gy-H*0.4-6;
        acc(0.85,1.8); spath([[cx-22,cy],[cx-22,cy-16],[cx-11,cy-4],[cx,cy-20],[cx+11,cy-4],[cx+22,cy-16],[cx+22,cy]],true,1.6);
        if(t%20===0) parts.spawn({x:cx+rnd(-20,20),y:cy,vy:-rnd(0.4,1),life:80,type:'star',r:3,col:PINK});
        caption('живи и сдохни, как король',W,H,0.5);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
