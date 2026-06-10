// T14 — Север
// студентка с книгами → юг→север, компас, ветер → полёт к ней → компас крутится, путь
function north(){
  let t=0; _pg=-1;
  const parts=mkParts(80);
  const snow=mkSnow(40);
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1,fem:true,face:'sad',a:0.72,hairFlow:Math.sin(t*0.04)*3});
        ink(0.5,1.3); srect(W*0.42,gy-18,W*0.16,14,1.2); txt('ВУЗ',W*0.5,gy-7,12,0.5);
        for(let i=0;i<3;i++) parts.spawn&&(t%30===0&&parts.spawn({x:W*0.5,y:gy-60,vy:-0.5,life:60,type:'note',txt:'5',r:2,col:[70,90,140]}));
        caption('ты училась на отлично, тебя заебал твой ВУЗ',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.14);
        // компас
        const cx=W*0.5,cy=H*0.42,r=W*0.16;
        ink(0.5,1.6); scir(cx,cy,r,2);
        txt('С',cx,cy-r+14,16,0.6); txt('Ю',cx,cy+r-4,16,0.5);
        const a1=-Math.PI/2; ink(0.7,2); sl(cx,cy,cx+Math.cos(a1)*r*0.7,cy+Math.sin(a1)*r*0.7,2);
        caption('мы с юга на север',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.16);
        ground(W,H,gy,0.2);
        // машина-полёт
        const mx=W*0.2+lp*W*0.6;
        ink(0.6,1.5); srect(mx,gy-26,W*0.18,18,1.4); scir(mx+W*0.04,gy-8,6,1.1); scir(mx+W*0.14,gy-8,6,1.1);
        ink(0.3,0.9); for(let i=0;i<5;i++) sl(mx-i*10,gy-18-i,mx-10-i*10,gy-18-i,0.7);
        caption('я к тебе лечу, пересекаю север',W,H,0.45);
      },
      (lp)=>{
        snow(W,H,0.18);
        const cx=W*0.5,cy=H*0.44,r=W*0.15;
        ink(0.5,1.6); scir(cx,cy,r,2);
        const a1=t*0.08; ink(0.7,2); sl(cx,cy,cx+Math.cos(a1)*r*0.7,cy+Math.sin(a1)*r*0.7,2);
        figure(W*0.5,gy-30,{s:0.7,fem:true,a:0.4,face:'calm'});
        caption('пересекаю юг, пересекаю юг',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
