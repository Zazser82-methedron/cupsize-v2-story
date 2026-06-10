// T20 — Урод
// школа, она отворачивается → мечта: популярность, $ → неон МОТЕЛЬ → один, пузырь-мечта, зеркало
function mirror(){
  let t=0; _pg=-1;
  const parts=mkParts(90);
  const C=[110,80,140];
  function f(){
    if(!animRunning)return;
    const W=cW(),H=cH(); bg(W,H); const p=prog(); t++;
    const gy=H*0.82;
    scenes(p,[
      (lp)=>{
        ground(W,H,gy,0.2);
        // школьная доска
        ink(0.35,1.3); srect(W*0.08,H*0.16,W*0.3,H*0.2,1.2);
        figure(W*0.4,gy-46,{s:1,face:'sad',a:0.7});
        figure(W*0.62,gy-46,{s:1,fem:true,face:'flat',a:0.6,flip:true,hairFlow:-3});
        caption('ты мне отказала, потому что я урод',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        figure(W*0.5,gy-46,{s:1,face:'happy',a:0.7});
        // подписчики/деньги
        if(t%12===0) parts.spawn({x:rnd(W*0.2,W*0.8),y:gy-rnd(20,70),vy:-rnd(0.4,1),life:90,type:'note',txt:(t%24===0?'$':'♥'),r:rnd(3,5),col:C});
        txt('1 000 000',W*0.5,H*0.24,Math.min(30,W*0.07),0.5,'rgba(110,80,140,0.6)');
        caption('я стану популярным в интернете',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // неон МОТЕЛЬ
        const fl=(Math.sin(t*0.3)>-0.3)?1:0.3;
        ink(0.5,1.4); srect(W*0.3,H*0.3,W*0.4,H*0.18,1.3);
        txt('МОТЕЛЬ',W*0.5,H*0.42,Math.min(34,W*0.08),0.7*fl,`rgba(200,74,106,${0.8*fl})`);
        caption('я сниму нам мотель где-то под вечер',W,H,0.45);
      },
      (lp)=>{
        ground(W,H,gy,0.2);
        // один за столом, зеркало с отражением
        figure(W*0.36,gy-30,{s:0.95,a:0.65,face:'sad',sit:true});
        ink(0.4,1.4); srect(W*0.6,H*0.24,W*0.16,H*0.3,1.3);
        ctx.save(); ctx.globalAlpha=0.5; figure(W*0.68,gy-30,{s:0.8,a:0.6,face:'sad',flip:true}); ctx.restore();
        // пузырь-мечта
        ink(0.3,1); scir(W*0.5,H*0.22,W*0.08,1.5);
        if(t%30===0) parts.spawn({x:W*0.5,y:H*0.22,vy:-0.3,life:80,type:'heart',r:3,col:C});
        caption('я тощий додик и мечтаю…',W,H,0.45);
      },
    ]);
    parts.step(); parts.draw();
    vignettePulse(W,H,0.18); grain();
    rafId=requestAnimationFrame(f);
  } f();
}
