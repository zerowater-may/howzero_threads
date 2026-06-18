/* ============================================================
   용팀장 덱 — 공유 런타임 (deck.js)
   #stage 안에 .slide 들만 두면 HUD/네비/진행바/후기월을 자동 구성.
   - 슬라이드에 class="dark" 를 주면 그 슬라이드에서 HUD가 밝은 톤으로 전환.
   - 후기 월: <div class="wall" data-reviews="50" data-path="reviews/r"></div>
   ============================================================ */
(function(){
  const stage=document.getElementById('stage');
  if(!stage) return;

  // 진행바
  let prog=stage.querySelector('.prog');
  if(!prog){ prog=document.createElement('div'); prog.className='prog'; stage.insertBefore(prog, stage.firstChild); }

  // 후기/캡처 월 자동 채우기
  stage.querySelectorAll('.wall[data-reviews]').forEach(wall=>{
    const total=parseInt(wall.dataset.reviews,10)||0;
    const path=wall.dataset.path||'reviews/r';
    const cols=4, cls=['colA','colB','colC','colD'], colEls=[];
    for(let c=0;c<cols;c++){ const d=document.createElement('div'); d.className='col '+cls[c]; wall.appendChild(d); colEls.push(d); }
    for(let n=1;n<=total;n++){ const im=document.createElement('img'); im.loading='lazy'; im.alt='후기'; im.src=path+String(n).padStart(2,'0')+'.png'; colEls[(n-1)%cols].appendChild(im); }
    colEls.forEach(d=>{ d.innerHTML+=d.innerHTML; }); // 이음새 없는 루프
  });

  const slides=[...stage.querySelectorAll('.slide')];

  // HUD 주입
  const hud=document.createElement('div'); hud.className='hud';
  hud.innerHTML='<div class="dots"></div><div class="counter mono"><b class="cur">01</b> / <span class="tot">'+String(slides.length).padStart(2,'0')+'</span></div>';
  stage.appendChild(hud);
  const hint=document.createElement('div'); hint.className='navhint'; hint.textContent='← → 또는 화면 좌우 클릭'; stage.appendChild(hint);
  const zl=document.createElement('div'); zl.className='zone l'; stage.appendChild(zl);
  const zr=document.createElement('div'); zr.className='zone r'; stage.appendChild(zr);

  const dotsBox=hud.querySelector('.dots');
  const cur=hud.querySelector('.cur');
  slides.forEach((_,n)=>{ const d=document.createElement('div'); d.className='dot'; d.onclick=()=>go(n); dotsBox.appendChild(d); });
  const dots=[...dotsBox.children];

  let i=0;
  function go(n){
    i=Math.max(0,Math.min(slides.length-1,n));
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
    stage.classList.toggle('dark', slides[i].classList.contains('dark'));
    prog.style.width=((i+1)/slides.length*100)+'%';
    cur.textContent=String(i+1).padStart(2,'0');
  }
  zr.onclick=()=>go(i+1);
  zl.onclick=()=>go(i-1);
  addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();go(i+1);}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(i-1);}
    if(e.key==='Home')go(0); if(e.key==='End')go(slides.length-1);
  });
  go(0);
})();
