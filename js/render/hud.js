'use strict';
// Marcador: toneladas, récord, nivel y vidas.
(function (PP) {
  const FUENTE = "'Baloo 2', 'Trebuchet MS', sans-serif";
  const ORO = '#f4c430';

  function texto(ctx, t, x, y, { tam = 8, color = '#fff', alin = 'left', peso = 800 } = {}) {
    ctx.font = `${peso} ${tam}px ${FUENTE}`;
    ctx.textAlign = alin;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(t, x, y);
  }
  PP.texto = texto;

  // Botón de pausa (muestra "play" mientras está en pausa).
  function botonPausa(ctx, pausa) {
    const b = PP.BOTON_PAUSA;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 196, 48, 0.12)';
    ctx.fill();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = ORO;
    ctx.stroke();
    ctx.fillStyle = ORO;
    if (pausa) {
      ctx.beginPath();
      ctx.moveTo(b.x - 1.8, b.y - 3);
      ctx.lineTo(b.x + 3, b.y);
      ctx.lineTo(b.x - 1.8, b.y + 3);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(b.x - 2.6, b.y - 3, 1.8, 6);
      ctx.fillRect(b.x + 0.8, b.y - 3, 1.8, 6);
    }
  }

  // Botón de sonido: parlante con ondas, o tachado en silencio.
  function botonSonido(ctx, silencio) {
    const b = PP.BOTON_SONIDO;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 196, 48, 0.12)';
    ctx.fill();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = ORO;
    ctx.stroke();
    ctx.fillStyle = ORO;
    ctx.beginPath();
    ctx.moveTo(b.x - 3.4, b.y - 1.2);
    ctx.lineTo(b.x - 1.8, b.y - 1.2);
    ctx.lineTo(b.x + 0.4, b.y - 3.2);
    ctx.lineTo(b.x + 0.4, b.y + 3.2);
    ctx.lineTo(b.x - 1.8, b.y + 1.2);
    ctx.lineTo(b.x - 3.4, b.y + 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 0.6;
    if (silencio) {
      ctx.beginPath();
      ctx.moveTo(b.x + 1.6, b.y - 1.6);
      ctx.lineTo(b.x + 4.2, b.y + 1.6);
      ctx.moveTo(b.x + 4.2, b.y - 1.6);
      ctx.lineTo(b.x + 1.6, b.y + 1.6);
      ctx.stroke();
    } else {
      for (const r of [2, 3.6]) {
        ctx.beginPath();
        ctx.arc(b.x + 0.6, b.y, r, -0.8, 0.8);
        ctx.stroke();
      }
    }
  }

  PP.dibujarHud = function (ctx, { toneladas, record, nivel, vidas, frutasRecientes, pausa }) {
    botonPausa(ctx, pausa);
    botonSonido(ctx, PP.audio && PP.audio.silencio);
    texto(ctx, 'TONELADAS', 10, 7, { tam: 6.5, color: ORO });
    texto(ctx, PP.formatoToneladas(toneladas), 10, 16, { tam: 9 });
    texto(ctx, 'RÉCORD', PP.WIDTH / 2, 7, { tam: 6.5, color: ORO, alin: 'center' });
    texto(ctx, PP.formatoToneladas(record), PP.WIDTH / 2, 16, { tam: 9, alin: 'center' });
    texto(ctx, 'NIVEL', PP.WIDTH - 10, 7, { tam: 6.5, color: ORO, alin: 'right' });
    texto(ctx, String(nivel), PP.WIDTH - 10, 16, { tam: 9, alin: 'right' });

    // Vidas de reserva abajo a la izquierda.
    const y = PP.MAZE_Y + PP.MAZE_H + 9;
    for (let i = 0; i < vidas; i++) {
      PP.dibujarPacPapa(ctx, 18 + i * 15, y, { dir: PP.DIR.LEFT, mirada: -1, boca: 0.6, radio: 5 });
    }

    // Frutas de los últimos niveles, a la izquierda de la placa del nombre:
    // la del nivel actual queda junto a la placa.
    const lista = frutasRecientes || [];
    for (let i = 0; i < lista.length; i++) {
      const x = PP.PLACA.x - 9 - (lista.length - 1 - i) * 13;
      PP.dibujarFruta(ctx, x, y - 0.5, lista[i], 0.85);
    }
  };
})(window.PP);
