// T10 — ЗППП
// влечение друг к другу → «зараза» течёт между ними (дым) → ВИЧ-хаус, вместе → тонут в Неве
function pills(){
  let t=0; _pg=-1;
  const parts=mkParts(140);
  const C=[130,42,90];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.38,gy-46,{s:1,face:'happy',a:0.72,lean:lp*0.06});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'happy',a:0.72,lean:-lp*0.06,hairFlow:Math.sin(t*0.06)*4});
        if(t%30===0) parts.spawn({x:W*0.5,y:gy-60,vy:-rnd(0.3,0.7),life:80,type:'heart',r:4,col:C});
        caption('я так хочу заразиться тобою',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.34,gy-46,{s:1,face:'flat',a:0.7});
        figure(W*0.66,gy-46,{s:1,fem:true,face:'flat',a:0.7});
        // дым-зараза течёт изо рта в рот
        for(let i=0;i<2;i++){const x=W*0.4+Math.sin(t*0.05+i*3)*W*0.1+i*W*0.05; parts.spawn({x:x,y:gy-58,vx:0.6,vy:Math.sin(t*0.1)*0.3,life:60,type:'smoke',r:rnd(2,4),col:C});}
        caption('как дым сигарет, я проникну в твой рот',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        drawHouse(W*0.5,gy,1.6,0.55);
        ctx.fillStyle=`rgba(130,42,90,${0.12+0.06*EZ.pulse((t%90)/90)})`; ctx.fillRect(W*0.5-38,gy-42,76,42);
        figure(W*0.44,gy-30,{s:0.55,a:0.55,face:'flat'});
        figure(W*0.56,gy-30,{s:0.55,fem:true,a:0.55,face:'flat'});
        txt('ВИЧ-хаус',W*0.5,H*0.2,Math.min(24,W*0.055),0.5,'rgba(130,42,90,0.6)');
        caption('у нас ВИЧ-хаус, о боже',W,H,0.45);
      },
      (lp)=>{
        // Нева поднимается
        const wl=gy-EZ.io(lp)*H*0.5;
        figure(W*0.5,wl-30,{s:0.9,a:0.5,face:'calm',raise:0.3});
        ctx.fillStyle='rgba(74,106,122,0.25)'; ctx.fillRect(0,wl,W,H-wl);
        ink(0.4,1); for(let i=0;i<4;i++){const yy=wl+i*12; sl(0,yy+Math.sin(t*0.06+i)*4,W,yy+Math.cos(t*0.06+i)*4,1);}
        if(t%14===0) parts.spawn({x:W*0.5+rnd(-30,30),y:wl,vy:-rnd(0.5,1.2),life:40,type:'drop',r:2,col:[74,106,122]});
        caption('а после утонем с тобою в Неве',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
