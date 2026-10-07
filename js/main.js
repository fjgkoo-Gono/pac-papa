'use strict';
// Arranque y bucle de juego: lógica a 60 cuadros por segundo con paso
// fijo (como el original) y dibujo en cada cuadro de la pantalla.
(function (PP) {
  const T = PP.TILE;
  const lienzo = document.getElementById('juego');
  const ctx = lienzo.getContext('2d');

  const juego = new PP.Juego();
  const lab = juego.lab;

  let escala = 1;
  let fondoLaberinto = null;
  let capaHojuelas = null;
  let placa = null;
  let versionHojuelas = 0;

  // Ajusta el lienzo a la ventana sin deformar el laberinto.
  function ajustarTamano() {
    const esc = document.getElementById('escenario');
    const est = getComputedStyle(esc);
    const ancho = esc.clientWidth - parseFloat(est.paddingLeft) - parseFloat(est.paddingRight);
    const alto = esc.clientHeight - parseFloat(est.paddingTop) - parseFloat(est.paddingBottom);
    const ajuste = Math.min(ancho / PP.WIDTH, alto / PP.HEIGHT);
    if (!(ajuste > 0)) return;     // ventana aún sin tamaño
    const dpr = window.devicePixelRatio || 1;
    lienzo.style.width = `${Math.floor(PP.WIDTH * ajuste)}px`;
    lienzo.style.height = `${Math.floor(PP.HEIGHT * ajuste)}px`;
    lienzo.width = Math.round(PP.WIDTH * ajuste * dpr);
    lienzo.height = Math.round(PP.HEIGHT * ajuste * dpr);
    const nueva = lienzo.width / PP.WIDTH;
    if (!fondoLaberinto || Math.abs(nueva - escala) > 0.01) {
      escala = nueva;
      fondoLaberinto = PP.dibujarLaberinto(lab, escala);
      placa = PP.dibujarPlaca(escala);
      capaHojuelas = null;
    }
  }

  // Mantiene la capa de hojuelas al día con el laberinto.
  function actualizarHojuelas() {
    if (!capaHojuelas || versionHojuelas !== lab.version) {
      capaHojuelas = PP.crearCapaHojuelas(lab, escala);
      versionHojuelas = lab.version;
      lab.comidas.length = 0;
      return;
    }
    for (const { tx, ty } of lab.comidas) PP.borrarHojuela(capaHojuelas, tx, ty);
    lab.comidas.length = 0;
  }

  function dibujarBolsas() {
    for (let ty = 0; ty < PP.MAZE_ROWS; ty++) {
      for (let tx = 0; tx < PP.COLS; tx++) {
        if (lab.get(tx, ty) === 'o') {
          PP.dibujarBolsa(ctx, tx * T + T / 2, ty * T + T / 2, lab.saborBolsa(tx, ty));
        }
      }
    }
  }

  // Fruta bajo la casa y su puntaje al comerla.
  function dibujarFruta() {
    const fx = 14 * T, fy = PP.FRUTA_CASILLA.y * T + T / 2;
    if (juego.fruta && juego.fantasmasVisibles) PP.dibujarFruta(ctx, fx, fy, juego.fruta.tipo);
    if (juego.puntosFruta) {
      PP.texto(ctx, `${PP.formatoToneladas(juego.puntosFruta.puntos)}`, fx, fy, { tam: 6.5, color: '#ffb3d9', alin: 'center' });
    }
  }

  function dibujarPersonajes() {
    const pac = juego.pac;
    if (juego.pacVisible) {
      const muerte = juego.progresoMuerte;
      if (muerte === null) {
        PP.dibujarPacPapa(ctx, pac.x, pac.y, { dir: pac.dir, mirada: pac.mirada, boca: pac.boca });
      } else {
        const boca = 0.15 + muerte * (Math.PI - 0.15);
        PP.dibujarPacPapa(ctx, pac.x, pac.y, { dir: PP.DIR.UP, mirada: pac.mirada, boca });
      }
    }
    if (juego.fantasmasVisibles) {
      const comido = juego.puntosFlotantes && juego.puntosFlotantes.fantasma;
      for (const f of juego.fantasmas) {
        if (f !== comido) PP.dibujarFantasma(ctx, f, juego.cuadro, juego.sustoParpadea);
      }
    }
    // Toneladas ganadas al comer un fantasma.
    const pf = juego.puntosFlotantes;
    if (pf) {
      PP.texto(ctx, `${pf.puntos} T`, pf.x, pf.y, { tam: 6.5, color: '#7fe8ff', alin: 'center' });
    }
  }

  function dibujar() {
    if (!fondoLaberinto) return;
    actualizarHojuelas();

    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.fillStyle = '#0d0907';
    ctx.fillRect(0, 0, PP.WIDTH, PP.HEIGHT);

    if (juego.estado === 'titulo' || juego.estado === 'intermedio') {
      if (juego.estado === 'titulo') PP.dibujarTitulo(ctx, fondoLaberinto, juego.tiempo);
      else PP.dibujarIntermedio(ctx, juego.escena, juego.tiempo);
      PP.dibujarHud(ctx, juego);
      ctx.drawImage(placa, PP.PLACA.x - 2, PP.PLACA.y - 2, PP.PLACA.w + 4, PP.PLACA.h + 4);
      return;
    }

    ctx.drawImage(fondoLaberinto, 0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
    if (juego.laberintoIluminado) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55;
      ctx.drawImage(fondoLaberinto, 0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
      ctx.restore();
    }
    ctx.drawImage(capaHojuelas, 0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);

    // Bolsas y personajes, recortados al laberinto (se esconden en el túnel).
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, PP.MAZE_Y, PP.WIDTH, PP.MAZE_H);
    ctx.clip();
    ctx.translate(0, PP.MAZE_Y);
    dibujarBolsas();
    dibujarFruta();
    dibujarPersonajes();
    ctx.restore();

    PP.dibujarHud(ctx, juego);
    ctx.drawImage(placa, PP.PLACA.x - 2, PP.PLACA.y - 2, PP.PLACA.w + 4, PP.PLACA.h + 4);

    if (juego.estado === 'listo') {
      PP.texto(ctx, '¡LISTO!', PP.WIDTH / 2, PP.MAZE_Y + 17.5 * T, { tam: 10, color: '#f4c430', alin: 'center' });
    }
    if (juego.estado === 'gameOver') {
      PP.texto(ctx, 'GAME OVER', PP.WIDTH / 2, PP.MAZE_Y + 17.5 * T, { tam: 10, color: '#e8262b', alin: 'center' });
      ctx.fillStyle = 'rgba(13, 9, 7, 0.85)';
      ctx.fillRect(0, PP.MAZE_Y + 19.6 * T, PP.WIDTH, 3.2 * T);
      PP.texto(ctx, `Comiste ${PP.formatoToneladas(juego.toneladas)} de papa frita`, PP.WIDTH / 2, PP.MAZE_Y + 20.6 * T, { tam: 7.5, color: '#f4c430', alin: 'center' });
      if (juego.tiempo > 60) {
        PP.texto(ctx, 'Flecha o toque: jugar otra vez', PP.WIDTH / 2, PP.MAZE_Y + 22 * T, { tam: 5.5, color: '#fff', alin: 'center', peso: 600 });
      }
    }
    if (juego.pausa) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, PP.WIDTH, PP.HEIGHT);
      PP.texto(ctx, 'PAUSA', PP.WIDTH / 2, PP.HEIGHT / 2, { tam: 16, color: '#f4c430', alin: 'center' });
    }
  }

  PP.iniciarControles({
    lienzo,
    alMover: (dir) => {
      PP.audio.desbloquear();
      juego.pedir(dir);
      PP.mantenerPantallaEncendida();
    },
    alPausar: () => {
      PP.audio.desbloquear();
      juego.alternarPausa();
    },
    alSilenciar: () => {
      PP.audio.desbloquear();
      PP.audio.alternarSilencio();
    },
    // Los navegadores solo permiten sonido después de un gesto del usuario.
    alTocar: () => PP.audio.desbloquear(),
    alToqueSimple: () => juego.tocar(),
  });

  // Pausa automática al cambiar de aplicación o de pestaña.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (juego.estado === 'jugando' && !juego.pausa) juego.alternarPausa();
    } else {
      PP.mantenerPantallaEncendida();
    }
  });

  // App instalable y jugable sin conexión.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  window.addEventListener('resize', ajustarTamano);
  ajustarTamano();

  // La placa del nombre se pinta una vez: redibujarla con la fuente final.
  if (document.fonts) {
    document.fonts.load("800 10px 'Baloo 2'").then(() => {
      if (placa) placa = PP.dibujarPlaca(escala);
    });
  }

  const PASO = 1000 / PP.FPS;
  let pendiente = 0;
  let anterior = performance.now();
  function cuadro(ahora) {
    pendiente += Math.min(ahora - anterior, 250);
    anterior = ahora;
    while (pendiente >= PASO) {
      juego.actualizar();
      pendiente -= PASO;
    }
    PP.audio.actualizar(juego);
    dibujar();
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  // Acceso para depurar desde la consola.
  PP.debug = { juego };
})(window.PP);
