'use strict';
// Pantalla de título e intermedios (escenas cómicas entre niveles).
//
//  Intermedio 1 (tras el nivel 2): Golpe de Calor persigue a Pac-Papa; vuelve
//    asustado, perseguido por un Pac-Papa gigante.
//  Intermedio 2 (tras el nivel 5): Golpe de Calor pasa bajo la lluvia de El Niño
//    y se apaga a medias; huye chiquito.
//  Intermedio 3 (tras los niveles 9, 13 y 17): Golpe de Calor, convertido en una
//    brasita humeante, cruza la pantalla con El Niño lloviéndole encima.
(function (PP) {
  const D = PP.DIR;
  const ORO = '#f4c430';
  const Y = 150;   // altura de las escenas (píxeles del laberinto)

  const boca = (dist) => {
    const fase = (dist % 16) / 16;
    return 0.06 + (1 - Math.abs(fase * 2 - 1)) * 0.72;
  };

  // Fantasma "de utilería" para reutilizar el dibujo del juego.
  const actor = (id, x, y, dir, t, asustado = false) =>
    ({ id, x, y, dir, estado: 'afuera', asustado, distancia: t });

  // ---------- Título ----------

  const PERSONAJES = [
    { id: 'fuego', nombre: 'GOLPE DE CALOR', apodo: 'te persigue sin descanso', color: '#ff6a2a' },
    { id: 'nino', nombre: 'EL NIÑO', apodo: 'llega adelantado', color: '#8fb6e0' },
    { id: 'coco', nombre: 'COCO', apodo: 'nunca sabes por dónde sale', color: '#d29a5e' },
    { id: 'canto', nombre: 'CANTO RODADO', apodo: 'va y viene', color: '#cfc9bf' },
  ];

  PP.dibujarTitulo = function (ctx, fondo, t) {
    ctx.drawImage(fondo, 0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
    ctx.fillStyle = 'rgba(13, 9, 7, 0.84)';
    ctx.fillRect(0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);

    // Título con relieve dorado.
    ctx.save();
    ctx.font = "800 27px 'Baloo 2', 'Arial Black', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3a210c';
    ctx.strokeText('PAC-PAPA', PP.WIDTH / 2, 56);
    const g = ctx.createLinearGradient(0, 44, 0, 68);
    g.addColorStop(0, '#fff2a8');
    g.addColorStop(0.5, '#f4c430');
    g.addColorStop(1, '#b8740e');
    ctx.fillStyle = g;
    ctx.fillText('PAC-PAPA', PP.WIDTH / 2, 56);
    ctx.restore();
    PP.texto(ctx, 'Aventura en el templo inca', PP.WIDTH / 2, 74, { tam: 7, color: '#e8dcc0', alin: 'center', peso: 600 });

    // Pac-Papa yendo y viniendo, comiendo hojuelas.
    const ida = (t % 360) < 180;
    const fase = (t % 180) / 180;
    const px = ida ? 40 + fase * 144 : 184 - fase * 144;
    for (let i = 0; i < 9; i++) {
      const hx = 40 + i * 18;
      const comida = ida ? hx < px : hx > px;
      if (!comida) PP.dibujarHojuela(ctx, hx, 98, 300 + i, 2.2);
    }
    PP.dibujarPacPapa(ctx, px, 98, { dir: ida ? D.RIGHT : D.LEFT, mirada: ida ? 1 : -1, boca: boca(t * 1.2), radio: 8 });

    // Personajes, apareciendo uno por uno como en el original.
    PP.texto(ctx, 'PERSONAJES', PP.WIDTH / 2, 124, { tam: 6.5, color: ORO, alin: 'center' });
    PERSONAJES.forEach((p, i) => {
      if (t < 30 + i * 30) return;
      const y = 140 + i * 18;
      PP.dibujarFantasma(ctx, actor(p.id, 50, y, D.RIGHT, t), t, false);
      PP.texto(ctx, p.nombre, 66, y - 3, { tam: 7.5, color: p.color });
      PP.texto(ctx, p.apodo, 66, y + 4.5, { tam: 5.2, color: '#b9ad98', peso: 600 });
    });

    // Valores.
    if (t >= 150) {
      PP.dibujarHojuela(ctx, 70, 218, 7, 2.2);
      PP.texto(ctx, '10 T', 78, 218.5, { tam: 7, color: '#fff' });
      PP.dibujarBolsa(ctx, 130, 218, 'jalapeno');
      PP.texto(ctx, '50 T', 139, 218.5, { tam: 7, color: '#fff' });
    }

    if (Math.floor(t / 30) % 2 === 0) {
      PP.texto(ctx, 'Presiona una flecha o desliza el dedo', PP.WIDTH / 2, 244, { tam: 6.2, color: ORO, alin: 'center' });
      PP.texto(ctx, 'para empezar', PP.WIDTH / 2, 253, { tam: 6.2, color: ORO, alin: 'center' });
    }
  };

  // ---------- Intermedios ----------

  function intermedio1(ctx, t) {
    if (t < 250) {
      PP.dibujarPacPapa(ctx, 250 - 1.25 * t, Y, { dir: D.LEFT, mirada: -1, boca: boca(t * 1.25) });
      PP.dibujarFantasma(ctx, actor('fuego', 290 - 1.35 * t, Y, D.LEFT, t), t, false);
    } else {
      const u = t - 250;
      PP.dibujarFantasma(ctx, actor('fuego', -20 + 1.0 * u, Y, D.RIGHT, t, true), t, false);
      PP.dibujarPacPapa(ctx, -90 + 1.3 * u, Y - 10, { dir: D.RIGHT, mirada: 1, boca: boca(u * 1.3), radio: 18 });
    }
  }

  function vapor(ctx, x, y, t, cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const fase = ((t * 0.02 + i / cantidad) % 1);
      ctx.beginPath();
      ctx.arc(x + Math.sin(i * 2.3 + t * 0.05) * 4, y - fase * 22, 1.5 + fase * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(235, 238, 242, ${0.85 * (1 - fase)})`;
      ctx.fill();
    }
  }

  function lluvia(ctx, x, desdeY, hastaY, t, ancho = 14) {
    ctx.strokeStyle = '#6cc8ff';
    ctx.lineWidth = 0.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const fase = ((t * 0.05 + i * 0.37) % 1);
      const lx = x - ancho / 2 + (i * ancho) / 6;
      const ly = desdeY + fase * (hastaY - desdeY);
      ctx.globalAlpha = 0.9 - fase * 0.5;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 0.4, ly + 2.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function intermedio2(ctx, t) {
    // El Niño quieto arriba, lloviendo sobre un charco.
    ctx.beginPath();
    ctx.ellipse(112, Y + 7, 13, 2.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(80, 160, 230, 0.45)';
    ctx.fill();
    lluvia(ctx, 112, Y - 26, Y + 6, t);
    PP.dibujarFantasma(ctx, actor('nino', 112, Y - 34, t > 300 ? D.DOWN : D.LEFT, t), t, false);

    PP.dibujarPacPapa(ctx, 250 - 1.25 * t, Y, { dir: D.LEFT, mirada: -1, boca: boca(t * 1.25) });

    const llega = 139;
    let x, escala, dir;
    if (t < llega) {
      x = 300 - 1.35 * t; escala = 1; dir = D.LEFT;
    } else if (t < 230) {
      x = 112; escala = 1 - 0.45 * ((t - llega) / (230 - llega)); dir = D.UP;
      vapor(ctx, 112, Y - 4, t, 6);
    } else {
      x = 112 + 1.6 * (t - 230); escala = 0.55; dir = D.RIGHT;
      vapor(ctx, x, Y - 2, t, 3);
    }
    ctx.save();
    ctx.translate(x, Y + (1 - escala) * 5);
    ctx.scale(escala, escala);
    PP.dibujarFantasma(ctx, actor('fuego', 0, 0, dir, t), t, false);
    ctx.restore();
  }

  function brasa(ctx, x, y, t) {
    vapor(ctx, x - 2, y - 3, t, 5);
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 5, 3.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2c2420';
    ctx.fill();
    // Grietas encendidas que laten.
    const brillo = 0.55 + Math.sin(t * 0.2) * 0.3;
    ctx.strokeStyle = `rgba(255, 120, 30, ${brillo})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 3);
    ctx.lineTo(x - 1, y + 1.5);
    ctx.lineTo(x + 1, y + 3.4);
    ctx.lineTo(x + 3.2, y + 1.8);
    ctx.stroke();
    // Ojitos asustados.
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + s * 1.6, y + 0.4, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + s * 1.6 + 0.3, y + 0.4, 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#1b2a6b';
      ctx.fill();
    }
  }

  function intermedio3(ctx, t) {
    const x = -20 + 0.9 * t;
    ctx.save();
    ctx.translate(x, Y);
    ctx.scale(1.5, 1.5);
    brasa(ctx, 0, 0, t);
    ctx.restore();
    // El Niño va justo encima, lloviéndole.
    const nx = x - 3;
    lluvia(ctx, nx, Y - 24, Y + 2, t, 12);
    PP.dibujarFantasma(ctx, actor('nino', nx, Y - 32, D.RIGHT, t), t, false);
  }

  const ESCENAS = { 1: intermedio1, 2: intermedio2, 3: intermedio3 };

  PP.dibujarIntermedio = function (ctx, escena, t) {
    ctx.fillStyle = '#0d0907';
    ctx.fillRect(0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
    ctx.clip();
    ctx.translate(0, PP.MAZE_Y);
    ESCENAS[escena](ctx, t);
    ctx.restore();
    if (t > 30) PP.texto(ctx, 'Toca o presiona una flecha para saltar', PP.WIDTH / 2, PP.MAZE_Y + PP.MAZE_H - 10, { tam: 5, color: '#6f6457', alin: 'center', peso: 600 });
  };
})(window.PP);
