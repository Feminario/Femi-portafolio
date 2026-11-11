/* Confeti con los colores y las formas de Feminario. Uso: lanzarConfeti({ntp:150}) */
(function(){
  var BASE = (function(){
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/confeti\.js(\?.*)?$/, "") : "assets/";
  })();
  var FORMAS = ["forma-estrella.png","forma-sol.png","forma-estrella-morada.png","forma-destello.png","forma-estrella-naranja.png","forma-molinete.png"];
  var COLORES = ["#7E84AE","#C2CBFF","#CEA2DD","#DFF3AF","#F59356","#F7C175","#F9E1FF"];
  var imgs = FORMAS.map(function(f){ var im = new Image(); im.src = BASE + f; return im; });

  window.lanzarConfeti = function(opts){
    opts = opts || {};
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var n = opts.n || 150, dur = opts.dur || 3400, desde = (typeof opts.x === "number");
    var cv = document.createElement("canvas"); cv.className = "confeti";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = innerWidth, H = innerHeight;
    cv.width = W*dpr; cv.height = H*dpr; document.body.appendChild(cv);
    var ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    var ps = [];
    for (var i = 0; i < n; i++){
      if (desde){
        var ang = -Math.PI/2 + (Math.random()-.5)*2.4, v = 4 + Math.random()*9;
        ps.push({ x: opts.x, y: opts.y, vx: Math.cos(ang)*v, vy: Math.sin(ang)*v - 2,
          r: Math.random()*6.28, vr: (Math.random()-.5)*.3, s: 8 + Math.random()*12, c: COLORES[i % COLORES.length],
          tipo: i % 3, img: imgs[i % imgs.length] });
        continue;
      }
      var desdeLados = i % 2 === 0;
      ps.push({
        x: desdeLados ? (i % 4 === 0 ? -10 : W + 10) : Math.random()*W,
        y: desdeLados ? H*(.35 + Math.random()*.3) : -20 - Math.random()*H*.4,
        vx: desdeLados ? (i % 4 === 0 ? 1 : -1) * (5 + Math.random()*7) : (Math.random()-.5)*4,
        vy: desdeLados ? -(7 + Math.random()*8) : 2 + Math.random()*3,
        r: Math.random()*6.28, vr: (Math.random()-.5)*.3,
        s: 9 + Math.random()*14, c: COLORES[i % COLORES.length],
        tipo: i % 3, img: imgs[i % imgs.length]
      });
    }
    var t0 = performance.now();
    (function frame(t){
      var el = t - t0;
      ctx.clearRect(0, 0, W, H);
      var fade = el > dur - 700 ? Math.max(0, (dur - el)/700) : 1;
      ps.forEach(function(p){
        p.vy += .22; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.tipo === 0 && p.img.complete && p.img.naturalWidth){ ctx.drawImage(p.img, -p.s, -p.s, p.s*2, p.s*2); }
        else if (p.tipo === 1){ ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/4, p.s, p.s/2); }
        else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(0, 0, p.s/3, 0, 6.28); ctx.fill(); }
        ctx.restore();
      });
      if (el < dur) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  };
})();
