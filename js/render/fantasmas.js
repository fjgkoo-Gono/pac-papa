'use strict';
// Dibujo de los fantasmas: Golpe de Calor, El Niño, Coco y Canto rodado.
// Todos tienen ojos que miran hacia donde avanzan, como en el original.
(function (PP) {
  const D = PP.DIR;

  // ----- Ojos -----

  function ojos(ctx, dir, dy = -1, sep = 2.3) {
    const mx = dir.x * 0.75, my = dir.y * 0.85;
    for (const s of [-1, 1]) {
      const ox = s * sep + dir.x * 0.4, oy = dy + dir.y * 0.3;
      ctx.beginPath();
      ctx.ellipse(ox, oy, 1.65, 2.05, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 0.25;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ox + mx, oy + my, 0.95, 0, Math.PI * 2);
      ctx.fillStyle = '#1b2a6b';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox + mx + 0.3, oy + my - 0.35, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }

  // Cara asustada: ojitos y boca temblorosa.
  function caraAsustada(ctx, blanco) {
    const color = blanco ? '#e8262b' : '#ffd2b8';
    ctx.fillStyle = color;
    ctx.fillRect(-2.9, -2, 1.4, 1.4);
    ctx.fillRect(1.5, -2, 1.4, 1.4);
    ctx.beginPath();
    ctx.moveTo(-4, 2.6);
    for (let i = 0; i < 8; i++) ctx.lineTo(-4 + (i + 1), i % 2 === 0 ? 1.7 : 2.6);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // ----- Siluetas (dependen del tiempo para animarse) -----

  function siluetaFuego(t) {
    const f = (fase, amp) => Math.sin(t * 0.25 + fase) * amp;
    const p = new Path2D();
    p.moveTo(-5.6, 0.8);
    p.arc(0, 0.8, 5.6, Math.PI, 0, true);
    p.quadraticCurveTo(6.3, -2.5, 4 + f(0, 0.6), -6.6 + f(1, 0.5));
    p.quadraticCurveTo(2.6, -4.2, 1.9, -3.6);
    p.quadraticCurveTo(1.4, -6.5, 0 + f(2, 0.7), -8.4 + f(3, 0.6));
    p.quadraticCurveTo(-1.5, -6, -1.9, -3.6);
    p.quadraticCurveTo(-2.7, -4.3, -4 + f(4, 0.6), -6.6 + f(5, 0.5));
    p.quadraticCurveTo(-6.3, -2.5, -5.6, 0.8);
    p.closePath();
    return p;
  }

  function siluetaNube() {
    const p = new Path2D();
    p.arc(-3.6, 0.6, 3.1, 0, Math.PI * 2);
    p.moveTo(4, -2.2);
    p.arc(0, -2.2, 4, 0, Math.PI * 2);
    p.moveTo(6.7, 0.6);
    p.arc(3.6, 0.6, 3.1, 0, Math.PI * 2);
    p.rect(-3.6, 0.2, 7.2, 3.5);
    p.moveTo(-1.2, 2.2);
    p.arc(-3.6, 2.2, 1.5, 0, Math.PI * 2);
    p.moveTo(5.1, 2.2);
    p.arc(3.6, 2.2, 1.5, 0, Math.PI * 2);
    return p;
  }

  function siluetaCoco() {
    const p = new Path2D();
    p.ellipse(0, 0, 6, 5.9, 0, 0, Math.PI * 2);
    return p;
  }

  function siluetaCanto() {
    const p = new Path2D();
    p.ellipse(0, 0.4, 6.4, 5.6, 0, 0, Math.PI * 2);
    return p;
  }

  const SILUETAS = { fuego: siluetaFuego, nino: siluetaNube, coco: siluetaCoco, canto: siluetaCanto };

  // ----- Personajes -----

  function dibujarFuego(ctx, f, t) {
    const p = siluetaFuego(t);
    ctx.save();
    ctx.shadowColor = 'rgba(255, 110, 20, 0.85)';
    ctx.shadowBlur = 6;
    const g = ctx.createRadialGradient(0, 2.5, 0.5, 0, -1, 8.5);
    g.addColorStop(0, '#fff6b0');
    g.addColorStop(0.3, '#ffc233');
    g.addColorStop(0.62, '#f2541b');
    g.addColorStop(1, '#a8100c');
    ctx.fillStyle = g;
    ctx.fill(p);
    ctx.restore();
    // Núcleo más claro.
    ctx.beginPath();
    ctx.ellipse(0, 2.4, 3, 2.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 245, 190, 0.45)';
    ctx.fill();
    ojos(ctx, f.dir, -0.6);
  }

  function dibujarNino(ctx, f, t) {
    // Lluvia cayendo.
    ctx.strokeStyle = '#6cc8ff';
    ctx.lineWidth = 0.55;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const fase = ((t * 0.12 + i * 0.37) % 1);
      const x = -3.6 + i * 2.4;
      const y = 4 + fase * 3.2;
      ctx.globalAlpha = 1 - fase;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 0.3, y + 1.1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const p = siluetaNube();
    const g = ctx.createLinearGradient(0, -6.5, 0, 4);
    g.addColorStop(0, '#c7d6e6');
    g.addColorStop(0.5, '#7f97b2');
    g.addColorStop(1, '#3e5470');
    ctx.fillStyle = g;
    ctx.fill(p);
    // Relámpago pequeño en el borde.
    if (Math.floor(t / 40) % 3 === 0) {
      ctx.beginPath();
      ctx.moveTo(4.6, 2.6);
      ctx.lineTo(3.7, 4.6);
      ctx.lineTo(4.5, 4.6);
      ctx.lineTo(3.6, 6.6);
      ctx.strokeStyle = '#ffe44d';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ojos(ctx, f.dir, -0.4);
  }

  function dibujarCoco(ctx, f, t) {
    const p = siluetaCoco();
    const g = ctx.createRadialGradient(-2, -2.4, 0.5, 0, 0, 6.8);
    g.addColorStop(0, '#9a6a3a');
    g.addColorStop(0.6, '#6b4423');
    g.addColorStop(1, '#3a2210');
    ctx.fillStyle = g;
    ctx.fill(p);
    // Fibras del coco, agitándose.
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.35;
    const rnd = PP.rng(77);
    for (let i = 0; i < 34; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 4.2 + rnd() * 1.6;
      const largo = 1 + rnd() * 1.3;
      const viento = Math.sin(t * 0.2 + i) * 0.35;
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.98;
      ctx.strokeStyle = rnd() < 0.5 ? '#b8854c' : '#8a5a2c';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a + viento) * largo, y + Math.sin(a + viento) * largo);
      ctx.stroke();
    }
    // Los tres "ojitos" del coco, arriba.
    ctx.fillStyle = '#2a170a';
    for (const [x, y] of [[-1, -4.3], [1, -4.3], [0, -3.1]]) {
      ctx.beginPath();
      ctx.arc(x, y, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ojos(ctx, f.dir, 0.3);
  }

  function dibujarCanto(ctx, f) {
    const p = siluetaCanto();
    const g = ctx.createRadialGradient(-2.2, -2, 0.5, 0, 0.4, 7);
    g.addColorStop(0, '#e2ddd3');
    g.addColorStop(0.55, '#a7a096');
    g.addColorStop(1, '#5f594f');
    ctx.fillStyle = g;
    ctx.fill(p);
    // Vetas y pintas que giran al rodar.
    ctx.save();
    ctx.clip(p);
    const sentido = f.dir === D.LEFT || f.dir === D.UP ? -1 : 1;
    ctx.rotate(f.distancia * 0.18 * sentido);
    const rnd = PP.rng(31);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(60, 54, 46, 0.55)' : 'rgba(255, 252, 245, 0.55)';
      ctx.beginPath();
      ctx.arc((rnd() - 0.5) * 12, (rnd() - 0.5) * 11, 0.25 + rnd() * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(245, 240, 230, 0.6)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-6, 1.5);
    ctx.quadraticCurveTo(0, -1, 6, 2.2);
    ctx.stroke();
    ctx.restore();
    ctx.lineWidth = 0.3;
    ctx.strokeStyle = 'rgba(40, 35, 30, 0.6)';
    ctx.stroke(p);
    ojos(ctx, f.dir, -0.8);
  }

  const DIBUJOS = { fuego: dibujarFuego, nino: dibujarNino, coco: dibujarCoco, canto: dibujarCanto };

  // Silueta del personaje en azul (o blanco al parpadear), temblando.
  function dibujarAsustado(ctx, f, t, blanco) {
    ctx.translate(Math.sin(t * 1.7) * 0.35, 0);
    const p = SILUETAS[f.id](t);
    const g = ctx.createLinearGradient(0, -7, 0, 6);
    if (blanco) {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#c9d2ff');
    } else {
      g.addColorStop(0, '#6f8cff');
      g.addColorStop(1, '#2338b8');
    }
    ctx.fillStyle = g;
    ctx.fill(p);
    caraAsustada(ctx, blanco);
  }

  PP.dibujarFantasma = function (ctx, f, t, sustoParpadea) {
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.estado === 'ojos' || f.estado === 'entrando') {
      ojos(ctx, f.dir, 0);
    } else if (f.asustado) {
      dibujarAsustado(ctx, f, t, sustoParpadea);
    } else {
      DIBUJOS[f.id](ctx, f, t);
    }
    ctx.restore();
  };
})(window.PP);
