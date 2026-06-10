// T13 — Я без ума от тебя
// танец в такт → «сделаем облака» в квартире → без ума, сердца → оба под капюшоном, заражён
function heart(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[200,40,80];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        const sw=Math.sin(t*0.1)*0.1;
        figure(W*0.43,gy-46,{s:1,face:'happy',a:0.78,lean:sw});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'happy',a:0.78,lean:-sw,hairFlow:Math.sin(t*0.1)*5});
        caption('наши тела двигались в такт',W,H,0.45);
      },
      (lp)=>{
        // комната + облака дыма внутри
        ink(0.4,1.3); srect(W*0.2,H*0.18,W*0.6,gy-H*0.18,1.3);
        for(let i=0;i<3;i++) cloud(W*(0.35+i*0.18)+Math.sin(t*0.02+i)*8,H*0.32+Math.cos(t*0.02+i)*6,14,0.3);
        figure(W*0.4,gy-44,{s:0.85,a:0.6,face:'calm'});
        figure(W*0.6,gy-44,{s:0.85,fem:true,a:0.6,face:'calm'});
        caption('сделаем в нашей квартире облака',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,face:'love',a:0.78});
        if(t%8===0) parts.spawn({x:W*0.5+rnd(-60,60),y:gy-rnd(20,80),vy:-rnd(0.4,1.1),vx:rnd(-0.3,0.3),life:90,type:'heart',r:rnd(3,6),col:C});
        caption('я без ума от тебя, я без ума',W,H,0.5);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // оба под капюшонами
        figure(W*0.42,gy-46,{s:1,a:0.65,face:'flat',hair:'none'});
        figure(W*0.58,gy-46,{s:1,fem:true,a:0.65,face:'flat',hair:'none'});
        ink(0.6,1.4); sarc(W*0.42,gy-34,12,Math.PI*1.1,Math.PI*1.9,1.2); sarc(W*0.58,gy-34,12,Math.PI*1.1,Math.PI*1.9,1.2);
        if(t%16===0) parts.spawn({x:rnd(W*0.4,W*0.6),y:gy-50,vy:-rnd(0.3,0.7),life:80,type:'heart',r:4,col:C});
        caption('а я тобою заражён',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
