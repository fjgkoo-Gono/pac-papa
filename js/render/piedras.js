'use strict';
// Muros de piedra inca: bloques poligonales encajados, sin argamasa.
//
// Cada casilla se divide en 4 × 4 sub-celdas. Los muros se recortan un
// cuarto de casilla hacia los pasillos (para que se vean de 1,5 casillas
// de ancho, como en el original), se reparten en bloques de distinto
// tamaño y las esquinas de los bloques se desplazan al azar. Como los
// vértices son compartidos, las piedras encajan sin huecos, al estilo
// de Sacsayhuamán.
(function (PP) {
  const T = PP.TILE;
  const SUB = 4;
  const S = T / SUB;                  // tamaño de sub-celda (px lógicos)
  const W = PP.COLS * SUB;
  const H = PP.MAZE_ROWS * SUB;
  const SEMILLA = 1438;               // año de Pachacútec

  function generarPiedras(lab) {
    const rnd = PP.rng(SEMILLA);
    const tileDe = (s) => Math.floor(s / SUB);

    // 1. Sub-celdas de piedra: muro cuyo entorno inmediato es sólido.
    const piedra = [];
    for (let sy = 0; sy < H; sy++) {
      piedra.push([]);
      for (let sx = 0; sx < W; sx++) {
        let es = lab.get(tileDe(sx), tileDe(sy)) === '#';
        for (let dy = -1; dy <= 1 && es; dy++) {
          for (let dx = -1; dx <= 1 && es; dx++) {
            if (!lab.solida(tileDe(sx + dx), tileDe(sy + dy))) es = false;
          }
        }
        piedra[sy].push(es);
      }
    }
    const esPiedra = (sx, sy) => sx >= 0 && sy >= 0 && sx < W && sy < H && piedra[sy][sx];

    // 2. Repartir en bloques rectangulares de tamaño variable.
    const dueno = piedra.map((fila) => fila.map(() => -1));
    const rects = [];
    for (let sy = 0; sy < H; sy++) {
      for (let sx = 0; sx < W; sx++) {
        if (!piedra[sy][sx] || dueno[sy][sx] !== -1) continue;
        const anchoMax = 3 + Math.floor(rnd() * 5);   // 3–7 sub-celdas
        const altoMax = 2 + Math.floor(rnd() * 4);    // 2–5 sub-celdas
        const libreEn = (x, y) => esPiedra(x, y) && dueno[y][x] === -1;

        // Ancho: sin dejar una astilla de 1 sub-celda al lado.
        let disponible = 0;
        while (libreEn(sx + disponible, sy)) disponible++;
        let ancho = Math.min(anchoMax, disponible);
        if (disponible - ancho === 1) ancho++;

        // Alto: lo mismo hacia abajo.
        const filaLibre = (y) => {
          for (let i = 0; i < ancho; i++) if (!libreEn(sx + i, y)) return false;
          return true;
        };
        let altoDisp = 1;
        while (filaLibre(sy + altoDisp)) altoDisp++;
        let alto = Math.min(altoMax, altoDisp);
        if (altoDisp - alto === 1) alto++;
        const id = rects.length;
        for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) dueno[sy + j][sx + i] = id;
        rects.push({ x0: sx, y0: sy, x1: sx + ancho, y1: sy + alto });
      }
    }
    const duenoDe = (sx, sy) => (sx >= 0 && sy >= 0 && sx < W && sy < H ? dueno[sy][sx] : -1);

    // 3. Vértices compartidos y desplazados. Los vértices sobre el borde
    //    de un muro solo se mueven a lo largo del borde: el muro queda recto.
    const J = S * 0.42;
    const vertices = [];
    for (let vy = 0; vy <= H; vy++) {
      vertices.push([]);
      for (let vx = 0; vx <= W; vx++) {
        const a = esPiedra(vx - 1, vy - 1), b = esPiedra(vx, vy - 1);
        const c = esPiedra(vx - 1, vy), d = esPiedra(vx, vy);
        const moverX = a === b && c === d;
        const moverY = a === c && b === d;
        const jx = moverX ? (rnd() * 2 - 1) * J : 0;
        const jy = moverY ? (rnd() * 2 - 1) * J : 0;
        vertices[vy].push({ x: vx * S + jx, y: vy * S + jy });
      }
    }

    // Un vértice es esquina de la piedra si allí se juntan 3 o más
    // dueños distintos (incluido el pasillo).
    function esUnion(vx, vy) {
      const s = new Set([
        duenoDe(vx - 1, vy - 1), duenoDe(vx, vy - 1),
        duenoDe(vx - 1, vy), duenoDe(vx, vy),
      ]);
      return s.size >= 3;
    }

    // 4. Polígono de cada piedra recorriendo su contorno.
    return rects.map((r) => {
      const camino = [];
      for (let vx = r.x0; vx < r.x1; vx++) camino.push([vx, r.y0]);
      for (let vy = r.y0; vy < r.y1; vy++) camino.push([r.x1, vy]);
      for (let vx = r.x1; vx > r.x0; vx--) camino.push([vx, r.y1]);
      for (let vy = r.y1; vy > r.y0; vy--) camino.push([r.x0, vy]);
      const esquinas = new Set([`${r.x0},${r.y0}`, `${r.x1},${r.y0}`, `${r.x1},${r.y1}`, `${r.x0},${r.y1}`]);
      const puntos = camino
        .filter(([vx, vy]) => esquinas.has(`${vx},${vy}`) || esUnion(vx, vy))
        .map(([vx, vy]) => vertices[vy][vx]);

      // Tono de andesita y granito: grises cálidos y ocres.
      const oscura = rnd() < 0.15;
      return {
        puntos,
        h: 26 + rnd() * 16,
        s: 8 + rnd() * 14,
        l: oscura ? 34 + rnd() * 8 : 44 + rnd() * 14,
        semilla: Math.floor(rnd() * 1e9),
      };
    });
  }

  // Trazo de polígono con esquinas levemente redondeadas.
  function trazar(ctx, puntos, radio) {
    const n = puntos.length;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p0 = puntos[(i - 1 + n) % n], p1 = puntos[i], p2 = puntos[(i + 1) % n];
      const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const r1 = Math.min(radio, d1 / 2) / d1;
      const r2 = Math.min(radio, d2 / 2) / d2;
      const ax = p1.x + (p0.x - p1.x) * r1, ay = p1.y + (p0.y - p1.y) * r1;
      const bx = p1.x + (p2.x - p1.x) * r2, by = p1.y + (p2.y - p1.y) * r2;
      if (i === 0) ctx.moveTo(ax, ay);
      else ctx.lineTo(ax, ay);
      ctx.quadraticCurveTo(p1.x, p1.y, bx, by);
    }
    ctx.closePath();
  }

  function cajaDe(puntos) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of puntos) {
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    }
    return { x0, y0, x1, y1 };
  }

  function dibujarPiso(ctx, rnd) {
    ctx.fillStyle = '#16100b';
    ctx.fillRect(0, 0, PP.WIDTH, PP.MAZE_H);
    const luz = ctx.createRadialGradient(PP.WIDTH / 2, PP.MAZE_H / 2, 10, PP.WIDTH / 2, PP.MAZE_H / 2, PP.MAZE_H * 0.7);
    luz.addColorStop(0, 'rgba(120, 80, 45, 0.22)');
    luz.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = luz;
    ctx.fillRect(0, 0, PP.WIDTH, PP.MAZE_H);
    // Grano de tierra apisonada.
    for (let i = 0; i < 2600; i++) {
      const claro = rnd() < 0.5;
      ctx.fillStyle = claro ? `rgba(150, 110, 70, ${0.05 + rnd() * 0.08})` : `rgba(0, 0, 0, ${0.1 + rnd() * 0.15})`;
      const t = 0.3 + rnd() * 0.6;
      ctx.fillRect(rnd() * PP.WIDTH, rnd() * PP.MAZE_H, t, t);
    }
  }

  function dibujarPiedra(ctx, p) {
    const caja = cajaDe(p.puntos);
    const rnd = PP.rng(p.semilla);

    trazar(ctx, p.puntos, 0.7);
    const g = ctx.createLinearGradient(caja.x0, caja.y0, caja.x1, caja.y1);
    g.addColorStop(0, `hsl(${p.h}, ${p.s}%, ${p.l + 9}%)`);
    g.addColorStop(0.55, `hsl(${p.h}, ${p.s}%, ${p.l}%)`);
    g.addColorStop(1, `hsl(${p.h}, ${p.s + 4}%, ${p.l - 12}%)`);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.clip();
    // Textura granulada de la roca.
    const area = (caja.x1 - caja.x0) * (caja.y1 - caja.y0);
    for (let i = 0; i < area * 0.9; i++) {
      const claro = rnd() < 0.45;
      ctx.fillStyle = claro ? `rgba(255, 245, 225, ${0.06 + rnd() * 0.1})` : `rgba(25, 18, 12, ${0.08 + rnd() * 0.14})`;
      const t = 0.18 + rnd() * 0.35;
      ctx.fillRect(caja.x0 + rnd() * (caja.x1 - caja.x0), caja.y0 + rnd() * (caja.y1 - caja.y0), t, t);
    }
    // Cara abombada: luz arriba a la izquierda, sombra abajo a la derecha.
    ctx.translate(0.55, 0.55);
    trazar(ctx, p.puntos, 0.7);
    ctx.strokeStyle = 'rgba(255, 240, 215, 0.38)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.translate(-1.1, -1.1);
    trazar(ctx, p.puntos, 0.7);
    ctx.strokeStyle = 'rgba(25, 15, 8, 0.5)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Junta entre piedras.
    trazar(ctx, p.puntos, 0.7);
    ctx.strokeStyle = 'rgba(18, 12, 8, 0.85)';
    ctx.lineWidth = 0.32;
    ctx.stroke();
  }

  // Puerta de la casa: dintel de oro con tocapus.
  function dibujarPuerta(ctx) {
    const x = 13 * T - 1, y = 12 * T + 4, w = 2 * T + 2, h = 2.4;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#ffe08a');
    g.addColorStop(1, '#b8801c');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#5a2d0c';
    for (let i = 0; i < 5; i++) ctx.fillRect(x + 1.2 + i * 3.3, y + 0.7, 1.2, 1);
  }

  // Placa de piedra pulida con un nombre tallado, en el rectángulo dado.
  function dibujarInscripcion(ctx, texto, x0, y0, x1, y1) {
    const w = x1 - x0;
    const puntos = [
      { x: x0, y: y0 + 0.3 }, { x: x0 + w * 0.2, y: y0 }, { x: x1 - 0.4, y: y0 + 0.2 },
      { x: x1, y: y1 - 0.5 }, { x: x1 - w * 0.3, y: y1 }, { x: x0 + 0.3, y: y1 - 0.2 },
    ];

    // Sombra sobre el fondo.
    ctx.save();
    ctx.translate(0.5, 0.8);
    trazar(ctx, puntos, 1.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    ctx.restore();

    // Piedra pulida, un poco más clara que el resto del muro.
    trazar(ctx, puntos, 1.2);
    const g = ctx.createLinearGradient(x0, y0, x0 + 20, y1 + 10);
    g.addColorStop(0, 'hsl(34, 16%, 66%)');
    g.addColorStop(0.6, 'hsl(32, 14%, 55%)');
    g.addColorStop(1, 'hsl(30, 16%, 42%)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    const rnd = PP.rng(2026);
    for (let i = 0; i < w * (y1 - y0) * 0.8; i++) {
      ctx.fillStyle = rnd() < 0.45 ? `rgba(255, 245, 225, ${0.05 + rnd() * 0.08})` : `rgba(25, 18, 12, ${0.06 + rnd() * 0.1})`;
      ctx.fillRect(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), 0.3, 0.3);
    }
    ctx.translate(0.55, 0.55);
    trazar(ctx, puntos, 1.2);
    ctx.strokeStyle = 'rgba(255, 240, 215, 0.4)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.translate(-1.1, -1.1);
    trazar(ctx, puntos, 1.2);
    ctx.strokeStyle = 'rgba(25, 15, 8, 0.5)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
    trazar(ctx, puntos, 1.2);
    ctx.strokeStyle = 'rgba(18, 12, 8, 0.85)';
    ctx.lineWidth = 0.32;
    ctx.stroke();

    // Letras talladas: el surco tiene sombra arriba a la izquierda y
    // luz abajo a la derecha.
    // El espaciado entre letras también se suma tras la última: se compensa.
    const cx = (x0 + x1) / 2 + 1.1, cy = (y0 + y1) / 2 + 0.4;
    ctx.font = "800 10px 'Baloo 2', 'Arial Black', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2.2px';
    ctx.fillStyle = 'rgba(255, 245, 225, 0.55)';
    ctx.fillText(texto, cx + 0.35, cy + 0.35);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.85)';
    ctx.fillText(texto, cx - 0.3, cy - 0.3);
    ctx.fillStyle = 'hsl(30, 14%, 33%)';
    ctx.fillText(texto, cx, cy);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  // Dibuja el laberinto completo en un lienzo aparte, a la escala dada
  // (píxeles reales por píxel lógico).
  PP.dibujarLaberinto = function (lab, escala) {
    if (!PP._piedras) PP._piedras = generarPiedras(lab);
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(PP.WIDTH * escala);
    lienzo.height = Math.round(PP.MAZE_H * escala);
    const ctx = lienzo.getContext('2d');
    ctx.scale(escala, escala);

    dibujarPiso(ctx, PP.rng(7));

    // Sombra de los muros sobre el piso.
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2.5 * escala;
    ctx.shadowOffsetX = 0.5 * escala;
    ctx.shadowOffsetY = 1.1 * escala;
    ctx.fillStyle = '#4a4038';
    for (const p of PP._piedras) {
      trazar(ctx, p.puntos, 0.7);
      ctx.fill();
    }
    ctx.restore();

    for (const p of PP._piedras) dibujarPiedra(ctx, p);
    dibujarPuerta(ctx);
    return lienzo;
  };

  // Placa con el nombre, abajo a la derecha, fuera del laberinto y a la
  // altura de las vidas. Se dibuja una vez en un lienzo aparte.
  PP.PLACA = { x: PP.WIDTH - 62, y: PP.MAZE_Y + PP.MAZE_H + 2.5, w: 54, h: 12 };
  PP.dibujarPlaca = function (escala) {
    const P = PP.PLACA;
    const borde = 2;   // espacio para la sombra
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round((P.w + borde * 2) * escala);
    lienzo.height = Math.round((P.h + borde * 2) * escala);
    const ctx = lienzo.getContext('2d');
    ctx.scale(escala, escala);
    dibujarInscripcion(ctx, PP.INSCRIPCION, borde, borde, borde + P.w, borde + P.h);
    return lienzo;
  };
})(window.PP);
