(function () {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  let W, H, NAV_H = 0, FOOT_Y = 0, animId;
  const BUBBLE_COUNT = parseInt(canvas.dataset.bubbleCount) || 28;
  let mouseX = -9999, mouseY = -9999;
  let bubbles = [];


  function drawWater() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,    '#03045e');
    grad.addColorStop(0.22, '#0077b6');
    grad.addColorStop(0.6,  '#0096c7');
    grad.addColorStop(1,    '#00b4d8');
    ctx.globalAlpha = 1;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    for (const b of bubbles) {
      const cx = b.x, cy = b.y, r = b.r;
      const shade = ctx.createRadialGradient(cx-r*0.2, cy-r*0.25, 0, cx+r*0.15, cy+r*0.2, r);
      shade.addColorStop(0, 'rgba(120,200,240,0.04)');
      shade.addColorStop(0.65, 'rgba(0,50,110,0.07)');
      shade.addColorStop(1, 'rgba(0,20,80,0.22)');
      ctx.fillStyle = shade;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,220,255,0.5)';
      ctx.lineWidth = Math.max(0.6, r*0.055);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
      const hx=cx-r*0.33, hy=cy-r*0.33, hr=r*0.27;
      const hl = ctx.createRadialGradient(hx,hy,0,hx,hy,hr);
      hl.addColorStop(0, 'rgba(235,250,255,0.32)');
      hl.addColorStop(1, 'rgba(235,250,255,0)');
      ctx.fillStyle = hl;
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function makeBubble() {
    const r = 4 + Math.random() * 10;
    return {
      x: r + Math.random() * (W - r*2),
      y: NAV_H + r + Math.random() * (FOOT_Y - NAV_H - r*2),
      r, vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*1.2, dead: false, safe: 40
    };
  }

  function updateBubbles() {
    for (const b of bubbles) {
      if (b.safe > 0) b.safe--;
      b.vx += (Math.random()-0.5)*0.06;
      b.vy += (Math.random()-0.5)*0.06;
      const spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
      if (spd > 1.4) { b.vx=(b.vx/spd)*1.4; b.vy=(b.vy/spd)*1.4; }
      b.x += b.vx; b.y += b.vy;
      if (b.x-b.r < 0)  { b.x=b.r;     b.vx= Math.abs(b.vx); }
      if (b.x+b.r > W)  { b.x=W-b.r;   b.vx=-Math.abs(b.vx); }
      if (b.y-b.r < NAV_H)  { b.y=NAV_H+b.r; b.vy= Math.abs(b.vy); }
      if (b.y+b.r > FOOT_Y) { b.y=FOOT_Y-b.r; b.vy=-Math.abs(b.vy); }
    }
    for (let i=0; i<bubbles.length; i++) {
      for (let j=i+1; j<bubbles.length; j++) {
        const a=bubbles[i], b=bubbles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist2 = dx*dx+dy*dy;
        const minDist = a.r+b.r;
        if (dist2 >= minDist*minDist) continue;

        // Separate so they no longer overlap
        const dist = Math.sqrt(dist2) || 0.01;
        const nx=dx/dist, ny=dy/dist;
        const overlap = (minDist - dist) / 2;
        a.x += nx*overlap; a.y += ny*overlap;
        b.x -= nx*overlap; b.y -= ny*overlap;

        // Elastic velocity exchange along collision normal
        const dvx=a.vx-b.vx, dvy=a.vy-b.vy;
        const dot = dvx*nx + dvy*ny;
        if (dot < 0) continue; // already moving apart
        a.vx -= dot*nx; a.vy -= dot*ny;
        b.vx += dot*nx; b.vy += dot*ny;
      }
    }
  }

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    NAV_H = document.querySelector('nav')?.offsetHeight || 0;
    const floor = document.querySelector('.products') || document.querySelector('footer');
    FOOT_Y = floor ? Math.min(floor.getBoundingClientRect().top, H) : H;
    bubbles = Array.from({ length: BUBBLE_COUNT }, makeBubble);
  }

  function loop() {
    updateBubbles();
    drawWater();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#caf0f8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 16, 0, Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; });
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); loop(); });
  init();
  loop();
})();
