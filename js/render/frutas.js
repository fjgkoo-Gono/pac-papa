'use strict';
// Frutas bonus andinas y amazónicas, dibujadas en un círculo de radio ~6.
(function (PP) {
  function sombra(ctx) {
    ctx.beginPath();
    ctx.ellipse(0.4, 5.2, 5, 1.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();
  }

  function brillo(ctx, x, y, rx, ry, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  }

  // Cancha: maíz tostado, un puñado de granos.
  function cancha(ctx) {
    sombra(ctx);
    const granos = [[-2.6, 1.8, 0.4], [2.4, 2, -0.5], [0, 2.6, 0.1], [-1.3, -0.4, -0.3], [1.5, -0.2, 0.6], [0, -2.6, 0]];
    for (const [x, y, rot] of granos) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -2.2);
      ctx.quadraticCurveTo(2, -1.8, 1.7, 0.8);
      ctx.quadraticCurveTo(0, 2.6, -1.7, 0.8);
      ctx.quadraticCurveTo(-2, -1.8, 0, -2.2);
      const g = ctx.createRadialGradient(-0.5, -0.8, 0.2, 0, 0, 2.6);
      g.addColorStop(0, '#ffe08a');
      g.addColorStop(0.6, '#e2a33a');
      g.addColorStop(1, '#a8601a');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 1.3, 0.7, 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#6b3510';
      ctx.fill();
      brillo(ctx, -0.6, -1, 0.4, 0.7);
      ctx.restore();
    }
  }

  // Haba: vaina verde con tres granos abultados.
  function haba(ctx) {
    sombra(ctx);
    ctx.save();
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.moveTo(-6.5, 0.6);
    ctx.quadraticCurveTo(-5, -2.8, -2, -2.2);
    ctx.quadraticCurveTo(0, -3.4, 2, -2.2);
    ctx.quadraticCurveTo(4.5, -3, 6.3, -0.6);
    ctx.quadraticCurveTo(6, 2.2, 2, 2);
    ctx.quadraticCurveTo(0, 2.8, -2, 2);
    ctx.quadraticCurveTo(-5, 2.6, -6.5, 0.6);
    const g = ctx.createLinearGradient(0, -3, 0, 3);
    g.addColorStop(0, '#a8e063');
    g.addColorStop(1, '#3f8a1e');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#2a6212';
    ctx.lineWidth = 0.35;
    ctx.stroke();
    for (const x of [-3.6, 0, 3.6]) {
      ctx.beginPath();
      ctx.ellipse(x, -0.2, 1.5, 1.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 245, 140, 0.55)';
      ctx.fill();
    }
    brillo(ctx, -1, -1.6, 2.6, 0.4);
    ctx.beginPath();
    ctx.moveTo(-6.5, 0.6);
    ctx.lineTo(-7.6, 1.4);
    ctx.strokeStyle = '#5a8a2a';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  // Raíz alargada con la punta cortada (yuca y camote).
  function raiz(ctx, piel, pielOscura, pulpa, rot) {
    sombra(ctx);
    ctx.save();
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(-6.4, 0);
    ctx.quadraticCurveTo(-4.5, -3, 0, -2.9);
    ctx.quadraticCurveTo(4.8, -2.6, 6.2, -1.6);
    ctx.lineTo(6.2, 1.6);
    ctx.quadraticCurveTo(4.8, 2.6, 0, 2.9);
    ctx.quadraticCurveTo(-4.5, 3, -6.4, 0);
    const g = ctx.createLinearGradient(0, -3, 0, 3);
    g.addColorStop(0, piel);
    g.addColorStop(1, pielOscura);
    ctx.fillStyle = g;
    ctx.fill();
    // Rayas de la cáscara.
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 0.3;
    for (const x of [-3.5, -0.8, 2]) {
      ctx.beginPath();
      ctx.moveTo(x, -2.6);
      ctx.quadraticCurveTo(x + 0.6, 0, x, 2.6);
      ctx.stroke();
    }
    // Corte.
    ctx.beginPath();
    ctx.ellipse(6.2, 0, 0.9, 1.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = pulpa;
    ctx.fill();
    ctx.strokeStyle = pielOscura;
    ctx.lineWidth = 0.35;
    ctx.stroke();
    brillo(ctx, -1.5, -1.8, 2.8, 0.45);
    ctx.restore();
  }

  const yuca = (ctx) => raiz(ctx, '#a0663a', '#5e3618', '#fbf5e4', -0.45);
  const camote = (ctx) => raiz(ctx, '#c0436a', '#6e1f3c', '#ff9f3d', 0.45);

  // Plátano: amarillo, curvo, con puntas oscuras.
  function platano(ctx) {
    sombra(ctx);
    ctx.beginPath();
    ctx.moveTo(-5.4, -4.4);
    ctx.quadraticCurveTo(-4.2, 2.2, 5.4, 0.6);
    ctx.quadraticCurveTo(6.6, 1.2, 6.2, 2.6);
    ctx.quadraticCurveTo(-2, 8.2, -7.2, -2.2);
    ctx.quadraticCurveTo(-7, -4, -5.4, -4.4);
    const g = ctx.createLinearGradient(-4, -2, 2, 5);
    g.addColorStop(0, '#fff28a');
    g.addColorStop(0.5, '#f6d22a');
    g.addColorStop(1, '#c99a12');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#a07a10';
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.fillStyle = '#4a3410';
    ctx.beginPath();
    ctx.arc(-6.1, -3.9, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, 1.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
    brillo(ctx, -4.4, 0.4, 0.6, 2.4, -0.6);
  }

  // Taro (pituca): tubérculo redondo, marrón, con anillos y pelitos.
  function taro(ctx) {
    sombra(ctx);
    ctx.beginPath();
    ctx.ellipse(0, 0.5, 5, 5.4, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-1.5, -1.5, 0.5, 0, 0.5, 6);
    g.addColorStop(0, '#a77d5a');
    g.addColorStop(0.7, '#6b4a30');
    g.addColorStop(1, '#3d2818');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(30, 18, 8, 0.6)';
    ctx.lineWidth = 0.35;
    for (const y of [-2.6, -0.6, 1.4, 3.3]) {
      ctx.beginPath();
      ctx.ellipse(0, y, 4.6 - Math.abs(y + 0.5) * 0.45, 0.8, 0, 0, Math.PI);
      ctx.stroke();
    }
    // Brote morado arriba.
    ctx.beginPath();
    ctx.moveTo(-0.6, -4.6);
    ctx.quadraticCurveTo(0, -7, 1.2, -6.8);
    ctx.quadraticCurveTo(0.6, -5.4, 0.6, -4.6);
    ctx.fillStyle = '#b05a9a';
    ctx.fill();
    brillo(ctx, -2, -1.5, 0.8, 1.4, 0.3);
  }

  // Choclo: mazorca de granos grandes y blancos, con pancas verdes.
  function choclo(ctx) {
    sombra(ctx);
    ctx.save();
    ctx.rotate(0.35);
    // Pancas.
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 6.2);
      ctx.quadraticCurveTo(s * 5.5, 3, s * 3.2, -3.5);
      ctx.quadraticCurveTo(s * 2.2, 2, 0, 6.2);
      ctx.fillStyle = s < 0 ? '#5ea52a' : '#7cc23c';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(0, -0.6, 2.7, 5.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8dcae';
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (let fila = 0; fila < 7; fila++) {
      for (let col = 0; col < 3; col++) {
        const x = -1.8 + col * 1.8 + (fila % 2) * 0.4;
        const y = -5.4 + fila * 1.6;
        ctx.beginPath();
        ctx.ellipse(x, y, 0.85, 0.75, 0, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x - 0.3, y - 0.3, 0.1, x, y, 0.9);
        g.addColorStop(0, '#fffdf2');
        g.addColorStop(1, '#d9c88c');
        ctx.fillStyle = g;
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.restore();
  }

  // Papa nativa: dos papitas de colores, morada y amarilla.
  function papa(ctx) {
    sombra(ctx);
    const papita = (x, y, rx, ry, rot, claro, oscuro) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, 0.3, 0, 0, rx * 1.1);
      g.addColorStop(0, claro);
      g.addColorStop(1, oscuro);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 15, 25, 0.55)';
      for (const [ox, oy] of [[-rx * 0.4, 0.3], [rx * 0.35, -ry * 0.3], [rx * 0.1, ry * 0.5]]) {
        ctx.beginPath();
        ctx.arc(ox, oy, 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      brillo(ctx, -rx * 0.35, -ry * 0.45, rx * 0.35, ry * 0.18);
      ctx.restore();
    };
    papita(2, 1.4, 3.8, 3, 0.3, '#f7d66b', '#b8851e');
    papita(-1.8, -0.8, 4.2, 3.3, -0.4, '#b26fd6', '#4a1d6b');
  }

  const DIBUJOS = { cancha, haba, yuca, camote, platano, taro, choclo, papa };

  PP.dibujarFruta = function (ctx, x, y, tipo, escala = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(escala, escala);
    DIBUJOS[tipo](ctx);
    ctx.restore();
  };
})(window.PP);
