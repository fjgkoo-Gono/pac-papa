'use strict';
// Dibujo de los personajes (en píxeles lógicos).
(function (PP) {
  const D = PP.DIR;
  const ROJO_PERU = '#d91023';
  const BLANCO = '#ffffff';

  function anguloDe(dir, mirada) {
    if (dir === D.RIGHT) return 0;
    if (dir === D.DOWN) return Math.PI / 2;
    if (dir === D.LEFT) return Math.PI;
    if (dir === D.UP) return -Math.PI / 2;
    return mirada > 0 ? 0 : Math.PI;
  }

  // Pac-Papa: papa dorada vestida de Inca.
  //  - banda en diagonal roja, blanca y roja (bandera del Perú)
  //  - llauto: cinta roja y blanca con filos de oro
  //  - mascapaycha: borla roja sobre la frente
  //  - plumas de corequenque en la cabeza y orejera de oro
  // Los adornos miran a la izquierda o a la derecha (mirada) y no
  // giran con la boca. Al morir, la boca se abre hasta desaparecer.
  PP.dibujarPacPapa = function (ctx, x, y, { dir, mirada, boca, radio = 6 }) {
    if (boca >= Math.PI - 0.01) return;
    const abierta = boca > 1.5;   // muriendo: sin plumas ni ojo
    const r = radio;
    const m = mirada > 0 ? 1 : -1;
    const ang = anguloDe(dir, mirada);

    ctx.save();
    ctx.translate(x, y);

    // Plumas (detrás del cuerpo).
    for (const [dx, rot] of abierta ? [] : [[-0.12, -0.32], [0.1, -0.05]]) {
      ctx.save();
      ctx.translate(-m * 0.12 * r + dx * r, -0.82 * r);
      ctx.rotate(-m * rot);
      ctx.beginPath();
      ctx.ellipse(0, -0.42 * r, 0.14 * r, 0.42 * r, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f7f3ea';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -0.68 * r, 0.11 * r, 0.17 * r, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1d1712';
      ctx.fill();
      ctx.restore();
    }

    // Cuerpo con boca.
    const cuerpo = new Path2D();
    if (boca > 0.01) {
      cuerpo.moveTo(0, 0);
      cuerpo.arc(0, 0, r, ang + boca, ang + Math.PI * 2 - boca);
      cuerpo.closePath();
    } else {
      cuerpo.arc(0, 0, r, 0, Math.PI * 2);
    }
    const g = ctx.createRadialGradient(-0.35 * r, -0.4 * r, 0.1 * r, 0, 0, r * 1.1);
    g.addColorStop(0, '#ffe7a3');
    g.addColorStop(0.45, '#f5bf45');
    g.addColorStop(1, '#c47a1c');
    ctx.fillStyle = g;
    ctx.fill(cuerpo);

    ctx.save();
    ctx.clip(cuerpo);

    // "Ojitos" de papa.
    ctx.fillStyle = 'rgba(120, 70, 20, 0.55)';
    for (const [px, py, pr] of [[-0.42, 0.38, 0.07], [0.18, 0.6, 0.06], [-0.1, 0.25, 0.05]]) {
      ctx.beginPath();
      ctx.arc(-m * px * r, py * r, pr * r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Banda en diagonal con los colores de la bandera del Perú.
    ctx.save();
    ctx.translate(-m * 0.1 * r, 0.45 * r);
    ctx.rotate(Math.atan2(1, m));
    const bw = 0.38 * r;
    ctx.fillStyle = ROJO_PERU;
    ctx.fillRect(-2 * r, -bw / 2, 4 * r, bw);
    ctx.fillStyle = BLANCO;
    ctx.fillRect(-2 * r, -bw / 6, 4 * r, bw / 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(-2 * r, bw / 2 - 0.05 * r, 4 * r, 0.05 * r);
    ctx.restore();

    // Llauto: cinta roja y blanca, con filos de oro.
    const y0 = -0.8 * r, y1 = -0.44 * r;
    const tercio = (y1 - y0) / 3;
    ctx.fillStyle = ROJO_PERU;
    ctx.fillRect(-r, y0, 2 * r, y1 - y0);
    ctx.fillStyle = BLANCO;
    ctx.fillRect(-r, y0 + tercio, 2 * r, tercio);
    ctx.fillStyle = '#f4c430';
    ctx.fillRect(-r, y0, 2 * r, 0.06 * r);
    ctx.fillRect(-r, y1 - 0.06 * r, 2 * r, 0.06 * r);

    // Mascapaycha: borla roja colgando sobre la frente.
    const bx = m * 0.22 * r, bbw = 0.26 * r;
    ctx.fillStyle = ROJO_PERU;
    ctx.fillRect(bx - bbw / 2, y1, bbw, 0.3 * r);
    ctx.strokeStyle = '#8f140e';
    ctx.lineWidth = 0.05 * r;
    for (let i = 1; i < 4; i++) {
      const lx = bx - bbw / 2 + (bbw * i) / 4;
      ctx.beginPath();
      ctx.moveTo(lx, y1);
      ctx.lineTo(lx, y1 + 0.3 * r);
      ctx.stroke();
    }

    // Orejera de oro.
    ctx.beginPath();
    ctx.arc(-m * 0.52 * r, -0.08 * r, 0.2 * r, 0, Math.PI * 2);
    ctx.fillStyle = '#f2c94c';
    ctx.fill();
    ctx.lineWidth = 0.06 * r;
    ctx.strokeStyle = '#9a6a12';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-m * 0.52 * r, -0.08 * r, 0.07 * r, 0, Math.PI * 2);
    ctx.fillStyle = '#9a6a12';
    ctx.fill();

    ctx.restore();

    // Ojo.
    if (abierta) {
      ctx.restore();
      return;
    }
    let ox, oy;
    if (dir === D.UP) { ox = m * 0.36 * r; oy = -0.04 * r; }
    else if (dir === D.DOWN) { ox = m * 0.3 * r; oy = -0.3 * r; }
    else { ox = -m * 0.06 * r; oy = -0.28 * r; }
    ctx.beginPath();
    ctx.arc(ox, oy, 0.13 * r, 0, Math.PI * 2);
    ctx.fillStyle = '#1d1712';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ox + 0.04 * r, oy - 0.04 * r, 0.045 * r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Contorno suave.
    ctx.lineWidth = 0.35;
    ctx.strokeStyle = 'rgba(110, 60, 10, 0.55)';
    ctx.stroke(cuerpo);

    ctx.restore();
  };
})(window.PP);
