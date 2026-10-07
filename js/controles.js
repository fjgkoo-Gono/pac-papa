'use strict';
// Controles:
//  - Teclado: flechas o WASD, P / Esc para pausa.
//  - Táctil (y mouse): deslizar el dedo en cualquier parte de la pantalla.
//    Se puede cambiar de dirección sin levantar el dedo.
//  - Botones de pausa y sonido dibujados en el marcador (M: silencio).
(function (PP) {
  const D = PP.DIR;
  const TECLAS = {
    ArrowUp: D.UP, KeyW: D.UP,
    ArrowDown: D.DOWN, KeyS: D.DOWN,
    ArrowLeft: D.LEFT, KeyA: D.LEFT,
    ArrowRight: D.RIGHT, KeyD: D.RIGHT,
  };
  const UMBRAL_DESLIZAR = 14;   // píxeles de pantalla

  // Botones del marcador, en píxeles lógicos.
  PP.BOTON_SONIDO = { x: 150, y: 12, r: 7 };
  PP.BOTON_PAUSA = { x: 168, y: 12, r: 7 };
  const tocaBoton = (p, b) => Math.hypot(p.x - b.x, p.y - b.y) <= b.r + 2;

  PP.iniciarControles = function ({ lienzo, alMover, alPausar, alSilenciar, alTocar, alToqueSimple }) {
    window.addEventListener('keydown', (e) => {
      const dir = TECLAS[e.code];
      if (dir) {
        e.preventDefault();
        alMover(dir);
        return;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        alPausar();
      } else if (e.code === 'KeyM') {
        alSilenciar();
      }
    });

    // Convierte coordenadas de pantalla a píxeles lógicos del juego.
    const aLogico = (e) => {
      const r = lienzo.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * PP.WIDTH,
        y: ((e.clientY - r.top) / r.height) * PP.HEIGHT,
      };
    };

    let inicio = null;
    window.addEventListener('pointerdown', (e) => {
      alTocar();
      const p = aLogico(e);
      if (tocaBoton(p, PP.BOTON_PAUSA)) {
        alPausar();
        return;
      }
      if (tocaBoton(p, PP.BOTON_SONIDO)) {
        alSilenciar();
        return;
      }
      inicio = { x: e.clientX, y: e.clientY, id: e.pointerId, movido: false };
    });

    window.addEventListener('pointermove', (e) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      const dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < UMBRAL_DESLIZAR) return;
      if (Math.abs(dx) > Math.abs(dy)) alMover(dx > 0 ? D.RIGHT : D.LEFT);
      else alMover(dy > 0 ? D.DOWN : D.UP);
      // El siguiente gesto se mide desde aquí: permite girar sin levantar el dedo.
      inicio.movido = true;
      inicio.x = e.clientX;
      inicio.y = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      if (!inicio.movido) alToqueSimple();
      inicio = null;
    });
    window.addEventListener('pointercancel', () => { inicio = null; });

    // Evita el desplazamiento y el zoom del navegador al jugar.
    window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  };

  // Mantiene la pantalla encendida mientras se juega (si el navegador lo permite).
  let bloqueo = null;
  PP.mantenerPantallaEncendida = async function () {
    if (!('wakeLock' in navigator) || bloqueo || document.visibilityState !== 'visible') return;
    try {
      bloqueo = await navigator.wakeLock.request('screen');
      bloqueo.addEventListener('release', () => { bloqueo = null; });
    } catch {
      // Sin permiso o sin soporte: no pasa nada.
    }
  };
})(window.PP);
