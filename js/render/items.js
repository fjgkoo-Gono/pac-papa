'use strict';
// Hojuelas Inkachips (lisas, irregulares) y bolsas de Inkachips.
(function (PP) {
  const T = PP.TILE;

  // Color de la franja de cada sabor, como en las bolsas reales.
  const SABORES = {
    salado: { franja: '#f7d417', sombra: '#b89a05' },     // Sal de Mar
    jalapeno: { franja: '#4fc62f', sombra: '#2a7a16' },   // Jalapeño
    bbq: { franja: '#e0161e', sombra: '#8c0b10' },        // BBQ & Cebolla
    queso: { franja: '#f47b16', sombra: '#a84a05' },      // Queso & Cebolla
  };
  PP.SABORES = SABORES;

  // Hojuela lisa: contorno irregular, dorada, con bordes más tostados
  // y burbujitas de fritura. La forma depende de la semilla.
  function dibujarHojuela(ctx, cx, cy, semilla, tam = 1.8) {
    const rnd = PP.rng(semilla);
    const n = 9;
    const giro = rnd() * Math.PI * 2;
    const alargue = 1.05 + rnd() * 0.2;
    const puntos = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.4;
      const r = tam * (0.78 + rnd() * 0.3);
      const x = Math.cos(a) * r * alargue, y = Math.sin(a) * r;
      puntos.push({
        x: cx + x * Math.cos(giro) - y * Math.sin(giro),
        y: cy + x * Math.sin(giro) + y * Math.cos(giro),
      });
    }

    const trazar = (dx = 0, dy = 0) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p = puntos[i], q = puntos[(i + 1) % n];
        const mx = (p.x + q.x) / 2 + dx, my = (p.y + q.y) / 2 + dy;
        if (i === 0) {
          const u = puntos[n - 1];
          ctx.moveTo((u.x + p.x) / 2 + dx, (u.y + p.y) / 2 + dy);
        }
        ctx.quadraticCurveTo(p.x + dx, p.y + dy, mx, my);
      }
      ctx.closePath();
    };

    // Sombra sobre el piso.
    trazar(0.3, 0.5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    trazar();
    const g = ctx.createRadialGradient(cx - tam * 0.3, cy - tam * 0.35, tam * 0.1, cx, cy, tam * 1.2);
    g.addColorStop(0, '#fff0b8');
    g.addColorStop(0.5, '#f5c95c');
    g.addColorStop(1, '#d48a2a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 0.28;
    ctx.strokeStyle = 'rgba(140, 75, 20, 0.9)';
    ctx.stroke();

    // Mancha tostada y burbujitas.
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(160, 90, 25, 0.35)';
    ctx.beginPath();
    ctx.arc(cx + (rnd() - 0.5) * tam, cy + (rnd() - 0.5) * tam, tam * 0.35, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const bx = cx + (rnd() - 0.5) * tam * 1.1, by = cy + (rnd() - 0.5) * tam * 1.1;
      const br = 0.12 + rnd() * 0.14;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 250, 220, 0.85)';
      ctx.fill();
      ctx.lineWidth = 0.08;
      ctx.strokeStyle = 'rgba(170, 100, 30, 0.6)';
      ctx.stroke();
    }
    ctx.restore();
  }
  PP.dibujarHojuela = dibujarHojuela;

  const semillaDe = (tx, ty) => tx * 7919 + ty * 104729 + 17;

  // Capa con todas las hojuelas, a la escala de pantalla. Se dibuja una
  // vez por nivel y se borra cada hojuela cuando Pac-Papa la come.
  PP.crearCapaHojuelas = function (lab, escala) {
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(PP.WIDTH * escala);
    lienzo.height = Math.round(PP.MAZE_H * escala);
    const ctx = lienzo.getContext('2d');
    ctx.scale(escala, escala);
    for (let ty = 0; ty < PP.MAZE_ROWS; ty++) {
      for (let tx = 0; tx < PP.COLS; tx++) {
        if (lab.get(tx, ty) === '.') dibujarHojuela(ctx, tx * T + T / 2, ty * T + T / 2, semillaDe(tx, ty));
      }
    }
    return lienzo;
  };

  PP.borrarHojuela = function (capa, tx, ty) {
    const ctx = capa.getContext('2d');
    ctx.clearRect(tx * T, ty * T, T, T);
  };

  // Bolsa de Inkachips, como las reales: plástico negro brillante, logo
  // "Inka CHIPS" en blanco, franja del color del sabor y un bowl de papas.
  PP.dibujarBolsa = function (ctx, cx, cy, sabor) {
    const c = SABORES[sabor];
    const w = 7.6, h = 9;
    const x0 = cx - w / 2, x1 = cx + w / 2;
    const y0 = cy - h / 2, y1 = cy + h / 2;

    // Brillo dorado alrededor: destaca la bolsa negra sobre el piso.
    const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 8);
    halo.addColorStop(0, 'rgba(255, 215, 110, 0.4)');
    halo.addColorStop(1, 'rgba(255, 215, 110, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 8, cy - 8, 16, 16);

    // Silueta de almohada: lados levemente abombados, sellos rectos.
    const cuerpo = new Path2D();
    cuerpo.moveTo(x0 + 0.3, y0);
    cuerpo.lineTo(x1 - 0.3, y0);
    cuerpo.lineTo(x1 - 0.1, y0 + 0.9);
    cuerpo.quadraticCurveTo(x1 + 0.4, cy, x1 - 0.1, y1 - 0.9);
    cuerpo.lineTo(x1 - 0.3, y1);
    cuerpo.lineTo(x0 + 0.3, y1);
    cuerpo.lineTo(x0 + 0.1, y1 - 0.9);
    cuerpo.quadraticCurveTo(x0 - 0.4, cy, x0 + 0.1, y0 + 0.9);
    cuerpo.closePath();

    // Sombra.
    ctx.save();
    ctx.translate(0.4, 0.6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill(cuerpo);
    ctx.restore();

    // Plástico negro con volumen.
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#030303');
    g.addColorStop(0.3, '#2e2e2e');
    g.addColorStop(0.7, '#141414');
    g.addColorStop(1, '#030303');
    ctx.fillStyle = g;
    ctx.fill(cuerpo);

    ctx.save();
    ctx.clip(cuerpo);

    // Sellos con estrías.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 0.1;
    for (const ys of [y0, y1 - 0.8]) {
      for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.45) {
        ctx.beginPath();
        ctx.moveTo(x, ys + 0.1);
        ctx.lineTo(x, ys + 0.7);
        ctx.stroke();
      }
    }

    // Logo.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const plata = ctx.createLinearGradient(0, y0 + 1.4, 0, y0 + 3.2);
    plata.addColorStop(0, '#ffffff');
    plata.addColorStop(1, '#c9c9c9');
    ctx.fillStyle = plata;
    ctx.font = "800 2.5px 'Baloo 2', 'Arial Black', sans-serif";
    ctx.fillText('Inka', cx, y0 + 2.45);
    ctx.font = "800 0.85px 'Baloo 2', 'Arial Black', sans-serif";
    ctx.fillText('CHIPS', cx + 0.5, y0 + 3.55);

    // Franja del sabor con sus dos líneas de texto.
    const fy = y0 + 4.05, fh = 1.75;
    const fg = ctx.createLinearGradient(0, fy, 0, fy + fh);
    fg.addColorStop(0, c.franja);
    fg.addColorStop(1, c.sombra);
    ctx.fillStyle = fg;
    ctx.fillRect(x0 - 1, fy, w + 2, fh);
    ctx.fillStyle = 'rgba(15, 10, 5, 0.85)';
    ctx.fillRect(cx - 1.7, fy + 0.4, 3.4, 0.3);
    ctx.fillRect(cx - 2.6, fy + 1.0, 5.2, 0.45);

    // Bowl negro con papas.
    ctx.fillStyle = '#f2c35a';
    for (const [dx, dy, r] of [[-0.9, -0.15, 0.7], [0.1, -0.45, 0.75], [0.95, -0.1, 0.65], [-0.2, 0.05, 0.6]]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx, y0 + 7.05 + dy, r, r * 0.6, dx * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(cx, y0 + 7.15, 1.75, 0.75, 0, 0, Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Reflejos del plástico.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x0 + 1.3, cy - 0.3, 0.35, 3.2, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x1 - 1.1, cy + 0.6, 0.25, 2.4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Borde claro para separarla del fondo.
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke(cuerpo);
  };
})(window.PP);
