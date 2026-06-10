// T11 — Станцуй со мной
// приглашение (рука) → танец вдвоём → глаза как яд → кружащийся танец, яд+сердца
function dance(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[200,74,106];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'calm',a:0.75,raiseR:0.6});
        figure(W*0.64,gy-46,{s:1,fem:true,face:'shy',a:0.7,hairFlow:Math.sin(t*0.05)*4});
        caption('станцуй со мной…',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        const sw=Math.sin(t*0.08)*0.12;
        figure(W*0.44,gy-46,{s:1,face:'happy',a:0.78,lean:sw,raiseR:0.5});
        figure(W*0.58,gy-46,{s:1,fem:true,face:'happy',a:0.78,lean:-sw,raiseL:0.5,hairFlow:Math.sin(t*0.1)*6});
        if(t%26===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy-50,vy:-rnd(0.4,0.9),life:80,type:'note',txt:'♪',r:3,col:C});
        caption('ведь ты мне сильно нравишься',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1.05,fem:true,face:'flat',a:0.7,hairFlow:Math.sin(t*0.06)*4});
        // ядовитые зелёные глаза
        ctx.fillStyle=`rgba(80,150,70,${0.6+0.3*EZ.pulse((t%60)/60)})`;
        ctx.beginPath(); ctx.arc(W*0.5-4,gy-48,2,0,7); ctx.arc(W*0.5+4,gy-48,2,0,7); ctx.fill();
        if(t%18===0) parts.spawn({x:W*0.5+rnd(-6,6),y:gy-46,vy:rnd(0.5,1.2),life:60,type:'drop',r:2,col:[80,150,70]});
        caption('твои глаза как яд',W,H,0.45);
      },
      (lp)=>{
        // кружение
        const cx=W*0.5,cy=gy-40,R=W*0.1;
        const a1=t*0.06;
        figure(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R*0.4,{s:0.95,face:'happy',a:0.72,lean:Math.sin(a1)*0.2});
        figure(cx+Math.cos(a1+Math.PI)*R,cy+Math.sin(a1+Math.PI)*R*0.4,{s:0.95,fem:true,face:'happy',a:0.72,lean:Math.sin(a1+Math.PI)*0.2,hairFlow:6});
        if(t%14===0) parts.spawn({x:cx+rnd(-50,50),y:cy-rnd(0,40),vy:-rnd(0.3,0.8),life:90,type:(t%28===0?'heart':'star'),r:rnd(3,5),col:C});
        caption('может быть, я поехал головой — станцуй со мной',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
