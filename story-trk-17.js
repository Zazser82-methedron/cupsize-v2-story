// T17 — По барабану
// падик 3 утра → взрыв вулкана (взорвёмся) → ванна, облака, курит → летать где-то
function drum(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[210,90,40];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        bldg(W*0.1,H*0.14,W*0.5,gy,0.35,6);
        drawMoon(W*0.82,H*0.18,16,0.5);
        figure(W*0.66,gy-44,{s:0.9,a:0.65,face:'calm'});
        figure(W*0.76,gy-44,{s:0.9,fem:true,a:0.65,face:'calm',hairFlow:Math.sin(t*0.05)*3});
        caption('твой падик родней, три утра',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // вулкан
        ink(0.6,1.6); sl(W*0.3,gy,W*0.44,gy-H*0.4,1.5); sl(W*0.7,gy,W*0.56,gy-H*0.4,1.5);
        // извержение по биту
        const burst=EZ.bounce(lp)+AUD.beat;
        if(t%4===0) for(let i=0;i<3;i++) parts.spawn({x:W*0.5+rnd(-14,14),y:gy-H*0.4,vx:rnd(-3,3),vy:-rnd(3,7)*(0.6+burst),g:0.12,life:70,type:(i%2?'shard':'dot'),r:rnd(2,4),col:C});
        caption('а давай по фану взорвёмся, подобно вулкану',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // ванна + облака
        ink(0.5,1.4); sellipse(W*0.5,gy-10,W*0.16,18,1.4);
        for(let i=0;i<3;i++) cloud(W*(0.36+i*0.16)+Math.sin(t*0.02+i)*6,H*0.3,12,0.3);
        figure(W*0.5,gy-30,{s:0.7,fem:true,a:0.6,face:'calm',hairFlow:Math.sin(t*0.06)*4});
        // дым сигареты
        if(t%20===0) parts.spawn({x:W*0.54,y:gy-44,vy:-rnd(0.5,1),vx:0.2,life:70,type:'smoke',r:3,col:[150,150,150]});
        caption('в ванной облака, ты куришь сигу',W,H,0.45);
      },
      (lp)=>{
        // летят
        for(let i=0;i<4;i++) cloud(W*(0.15+i*0.22)+Math.sin(t*0.01+i)*10,H*0.5+Math.cos(t*0.01+i)*30,14,0.2);
        figure(W*0.42,H*0.4+Math.sin(t*0.03)*10,{s:0.9,a:0.6,face:'happy',raise:0.7});
        figure(W*0.58,H*0.42+Math.cos(t*0.03)*10,{s:0.9,fem:true,a:0.6,face:'happy',raise:0.7,hairFlow:6});
        caption('давай летать где-то, давай представим',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
