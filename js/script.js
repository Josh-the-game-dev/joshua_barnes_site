
// Theme toggle, smooth scrolling, contact form demo, and canvas "wires" animation
(function(){
  // Theme
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored ? stored : (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);
  function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t); }

  document.addEventListener('click', function(e){
    const t = e.target.closest && e.target.closest('[data-toggle-theme]');
    if(t){
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(cur === 'light' ? 'dark' : 'light');
      return;
    }
    const s = e.target.closest && e.target.closest('[data-scroll-to]');
    if(s){
      const id = s.getAttribute('data-scroll-to');
      document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'});
    }
  });

  // Contact form demo
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();
      if(!name || !email || !msg){ alert('Please complete all fields.'); return; }
      alert('Thanks ' + name + '! (Demo) Your message was recorded.\\nEmail: joshuabarnes@ecloud.com');
      form.reset();
    });
  }

  // Canvas "wires" animation
  function initCanvas(){
    const canvas = document.getElementById('wires-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    window.addEventListener('resize', ()=>{ width = canvas.width = canvas.offsetWidth; height = canvas.height = canvas.offsetHeight; });

    // generate some paths (wires)
    const wires = [];
    const rows = 6;
    for(let i=0;i<rows;i++){
      const y = (i+1)*(height/(rows+1));
      const points = [];
      const cols = 8;
      for(let j=0;j<cols;j++){
        const x = (j+1)*(width/(cols+1)) + (Math.random()*40-20);
        points.push({x, y: y + (Math.random()*80-40)});
      }
      wires.push(points);
    }

    // pulses
    const pulses = [];

    function spawnPulse(){
      const w = wires[Math.floor(Math.random()*wires.length)];
      pulses.push({wire: w, t: 0, speed: 0.005+Math.random()*0.01, life:1});
    }

    let lastSpawn = 0;

    function draw(){
      ctx.clearRect(0,0,width,height);
      // draw wires
      for(const w of wires){
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#2f6b5a';
        ctx.moveTo(w[0].x, w[0].y);
        for(let i=1;i<w.length;i++){
          const p = w[i];
          const prev = w[i-1];
          const cx = (prev.x + p.x)/2;
          const cy = (prev.y + p.y)/2;
          ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
        }
        ctx.stroke();
      }

      // update pulses
      for(let i=pulses.length-1;i>=0;i--){
        const p = pulses[i];
        p.t += p.speed;
        if(p.t>1) { pulses.splice(i,1); continue; }
        // draw glow
        const idx = Math.floor(p.t*(p.wire.length-1));
        const frac = (p.t*(p.wire.length-1)) - idx;
        const a = p.wire[idx] || p.wire[p.wire.length-1];
        const b = p.wire[idx+1] || a;
        const x = a.x + (b.x-a.x)*frac;
        const y = a.y + (b.y-a.y)*frac;

        const grad = ctx.createRadialGradient(x,y,0,x,y,36);
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#13b06b';
        grad.addColorStop(0, accent);
        grad.addColorStop(0.5, accent + '55');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x,y,24,0,Math.PI*2);
        ctx.fill();

        // small bright core
        ctx.beginPath();
        ctx.fillStyle = '#fff9';
        ctx.arc(x,y,6,0,Math.PI*2);
        ctx.fill();
      }

      // spawn logic
      lastSpawn += 1/60;
      if(lastSpawn > 0.6 + Math.random()*1.2){ spawnPulse(); lastSpawn = 0; }
      requestAnimationFrame(draw);
    }
    draw();
  }

  document.addEventListener('DOMContentLoaded', initCanvas);
})();
