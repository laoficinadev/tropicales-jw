(function() {
  var hero = document.getElementById('inicio');
  if (!hero) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;width:100%;height:100%;';
  canvas.className = 'hero-canvas-bg';
  hero.insertBefore(canvas, hero.querySelector('.hero-overlay'));

  var ctx = canvas.getContext('2d');
  var particles = [];
  var animId;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(hero);
  resize();

  var count = Math.max(80, Math.floor((canvas.width * canvas.height) / 6000));

  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.2 + Math.random() * 0.8,
      size: 1 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.speed;

      if (p.x > canvas.width + 5) {
        p.x = -5;
        p.y = Math.random() * canvas.height;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  draw();
})();
