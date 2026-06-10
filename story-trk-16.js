// T16 — Напорносайтах
// батя и собаки (стыд) → даже собакам не нравится → за компом, порносайты (свечение) → весь день ничего
function browser(){
  let t=0; _pg=-1;
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.34,gy-46,{s:1,face:'flat',a:0.5});
        drawDog(W*0.56,gy-10,1,0.5,false);
        drawDog(W*0.72,gy-10,0.9,0.45,false);
        // знак стыда
        txt('…',W*0.34,H*0.32,24,0.4);
        caption('мой батя совокупляется с собаками',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'sad',a:0.65});
        // собака отворачивается
        drawDog(W*0.62,gy-10,1.1,0.5,false);
        ink(0.4,1); sl(W*0.55,gy-22,W*0.5,gy-26,0.8);
        caption('моё лицо даже собакам не нравится',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // фигура за монитором, свечение
        figure(W*0.42,gy-30,{s:0.9,a:0.6,face:'flat',sit:true});
        const glow=0.2+0.15*Math.sin(t*0.2);
        ctx.fillStyle=`rgba(100,100,110,${glow})`; ctx.fillRect(W*0.55,gy-50,W*0.22,34);
        ink(0.5,1.4); srect(W*0.55,gy-50,W*0.22,34,1.3); sl(W*0.66,gy-16,W*0.66,gy-6,1.2); sl(W*0.6,gy-6,W*0.72,gy-6,1.2);
        // censored bars
        fink(0.4); for(let i=0;i<3;i++) ctx.fillRect(W*0.57,gy-44+i*10,W*0.18,5);
        caption('поэтому я сижу на порносайтах',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-30,{s:0.9,a:0.55,face:'flat',sit:true,headTilt:0.2});
        // часы-время идёт
        ink(0.4,1.3); scir(W*0.72,H*0.28,18,1.6);
        const a1=t*0.05; sl(W*0.72,H*0.28,W*0.72+Math.cos(a1)*12,H*0.28+Math.sin(a1)*12,1.4);
        sl(W*0.72,H*0.28,W*0.72+Math.cos(a1*0.1)*8,H*0.28+Math.sin(a1*0.1)*8,1.2);
        caption('я ничего не делал весь день',W,H,0.45);
      },
    ]);
    vignettePulse(W,H,0.2); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
