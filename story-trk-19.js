// T19 — Малолетки
// малолетки беснуются (тусят) → ты хочешь со мной (не верится) → ночь, грусть, фото → бутылка, падик
function teens(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[180,80,140];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // толпа малолеток бесится
        for(let i=0;i<5;i++){const x=W*(0.12+i*0.16); figure(x,gy-40,{s:0.7,a:0.4,face:'happy',ph:t*0.2+i,raise:Math.abs(Math.sin(t*0.15+i))*0.8});}
        if(t%10===0) parts.spawn({x:rnd(W*0.1,W*0.9),y:gy-60,vy:-rnd(0.5,1.5),life:50,type:'star',r:2,col:C});
        caption('пока малолетки бесятся',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.4,gy-46,{s:1,face:'shock',a:0.7});
        figure(W*0.6,gy-46,{s:1,fem:true,face:'calm',a:0.7,hairFlow:Math.sin(t*0.05)*4});
        if(t%30<15) txt('?!',W*0.4,H*0.3,22,0.5,'rgba(180,80,140,0.6)');
        caption('ты хочешь со мной — мне не верится',W,H,0.45);
      },
      (lp)=>{
        drawMoon(W*0.8,H*0.18,15,0.5);
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:0.95,fem:true,face:'cry',a:0.65,hairLong:-10});
        drawPhone(W*0.62,gy-50,1,0.6,0.8);
        caption('я знаю, как ты по ночам дома грустишь',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        bldg(W*0.6,H*0.18,W*0.3,gy,0.3,5);
        figure(W*0.36,gy-44,{s:0.95,a:0.65,face:'calm'});
        figure(W*0.48,gy-44,{s:0.95,fem:true,a:0.65,face:'calm',hairFlow:Math.sin(t*0.05)*3});
        drawBottle(W*0.42,gy-26,0.9,0.6,Math.sin(t*0.04)*0.2);
        caption('бутылка, падик, ты и я',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
