// T24 — Ванна, красный пол
// ванна, красный пол, бинты (забота) → велосипед вдвоём → цветы и кот (не одна) → мир тонет в слезах, чудо
function bath(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const C=[190,50,60];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        // красный пол
        ctx.fillStyle='rgba(190,50,60,0.16)'; ctx.fillRect(0,gy,W,H-gy);
        ink(0.5,1.4); sellipse(W*0.5,gy-12,W*0.18,20,1.5);
        figure(W*0.4,gy-44,{s:0.9,a:0.65,face:'calm'});
        figure(W*0.58,gy-44,{s:0.9,fem:true,a:0.65,face:'sad',hairLong:-8});
        // бинты на руках
        ink(0.6,1.2); for(let i=0;i<3;i++) sl(W*0.5,gy-30+i*4,W*0.56,gy-30+i*4,1);
        caption('перемотаю твои руки, всё будет круто',W,H,0.45);
      },
      (lp)=>{
        ink(0.4,1.2); sl(0,gy,W,gy,1.4);
        const bx=W*0.2+lp*W*0.55;
        drawBike(bx,gy-14,1,0.7,t*0.25);
        figure(bx-2,gy-44,{s:0.7,a:0.7,face:'happy',ph:t*0.25,raiseR:0.3});
        figure(bx+12,gy-40,{s:0.6,fem:true,a:0.6,face:'happy',hairFlow:6});
        caption('мы разгонимся на велике, как гоночный болид',W,H,0.45);
      },
      (lp)=>{
        ink(0.4,1.2); sl(0,gy,W,gy,1.4);
        figure(W*0.4,gy-46,{s:1,face:'happy',a:0.7,raiseR:0.5});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'happy',a:0.72,hairFlow:Math.sin(t*0.05)*3});
        drawFlower(W*0.5,gy-30,1,0.8,Math.sin(t*0.06)*3);
        drawCat(W*0.7,gy-6,0.9,0.6,Math.sin(t*0.08)*0.4);
        if(t%26===0) parts.spawn({x:W*0.5+rnd(-40,40),y:gy-60,vy:-rnd(0.3,0.7),life:90,type:'heart',r:4,col:C});
        caption('ты никогда не будешь одна',W,H,0.45);
      },
      (lp)=>{
        // мир тонет в слезах
        const wl=gy-EZ.io(lp)*H*0.45;
        figure(W*0.4,wl-44,{s:0.9,a:0.6,face:'calm'});
        figure(W*0.58,wl-44,{s:0.9,fem:true,a:0.6,face:'calm',hairFlow:4});
        ctx.fillStyle='rgba(60,90,170,0.2)'; ctx.fillRect(0,wl,W,H-wl);
        ink(0.4,1); for(let i=0;i<3;i++){const yy=wl+i*14; sl(0,yy+Math.sin(t*0.05+i)*4,W,yy+Math.cos(t*0.05+i)*4,1);}
        ctx.globalAlpha=0.5+0.2*EZ.pulse((t%150)/150);
        txt('ты моё чудо',W*0.5,H*0.26,Math.min(28,W*0.065),0.7,'rgba(190,50,60,0.7)');
        ctx.globalAlpha=1;
        caption('пусть этот мир утонет завтра, как ванна',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.16); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
