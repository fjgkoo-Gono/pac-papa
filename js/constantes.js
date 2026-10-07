'use strict';
// Constantes generales del juego. Todas las medidas lógicas usan la
// resolución del original: casillas de 8 px en una pantalla de 28 × 36.
window.PP = window.PP || {};

(function (PP) {
  PP.TILE = 8;
  PP.COLS = 28;
  PP.ROWS = 36;              // pantalla completa, en casillas
  PP.MAZE_ROWS = 31;         // filas del laberinto
  PP.MAZE_TOP = 3;           // filas del marcador sobre el laberinto
  PP.WIDTH = PP.COLS * PP.TILE;    // 224
  PP.HEIGHT = PP.ROWS * PP.TILE;   // 288
  PP.MAZE_Y = PP.MAZE_TOP * PP.TILE;
  PP.MAZE_H = PP.MAZE_ROWS * PP.TILE;

  PP.FPS = 60;
  // 100 % de velocidad en el original: 75,75757625 px por segundo.
  PP.SPEED_100 = 75.75757625 / 60;

  PP.TUNEL_FILA = 14;

  // Nombre tallado en el muro inferior izquierdo.
  PP.INSCRIPCION = 'GONO';

  function dir(x, y, nombre) {
    return Object.freeze({ x, y, nombre });
  }
  PP.DIR = Object.freeze({
    UP: dir(0, -1, 'arriba'),
    LEFT: dir(-1, 0, 'izquierda'),
    DOWN: dir(0, 1, 'abajo'),
    RIGHT: dir(1, 0, 'derecha'),
    NONE: dir(0, 0, 'ninguna'),
  });

  PP.opuesta = function (d) {
    const D = PP.DIR;
    if (d === D.UP) return D.DOWN;
    if (d === D.DOWN) return D.UP;
    if (d === D.LEFT) return D.RIGHT;
    if (d === D.RIGHT) return D.LEFT;
    return D.NONE;
  };

  // Velocidades por nivel, en fracción de la velocidad máxima.
  PP.velocidades = function (nivel) {
    if (nivel === 1) return { pac: 0.80, pacAsustando: 0.90, fantasma: 0.75, fantasmaAsustado: 0.50, tunel: 0.40 };
    if (nivel <= 4) return { pac: 0.90, pacAsustando: 0.95, fantasma: 0.85, fantasmaAsustado: 0.55, tunel: 0.45 };
    if (nivel <= 20) return { pac: 1.00, pacAsustando: 1.00, fantasma: 0.95, fantasmaAsustado: 0.60, tunel: 0.50 };
    return { pac: 0.90, pacAsustando: 0.90, fantasma: 0.95, fantasmaAsustado: 0.95, tunel: 0.50 };
  };
  PP.VELOCIDAD_OJOS = 2.0;
  PP.VELOCIDAD_CASA = 0.5;

  // Ciclo dispersión / persecución: duración de cada fase en cuadros,
  // empezando por dispersión. Después de la última, persecución sin fin.
  PP.tablaModos = function (nivel) {
    const s = (seg) => Math.round(seg * 60);
    if (nivel === 1) return [7, 20, 7, 20, 5, 20, 5].map(s);
    if (nivel <= 4) return [7, 20, 7, 20, 5, 1033].map(s).concat([1]);
    return [5, 20, 5, 20, 5, 1037].map(s).concat([1]);
  };

  // Duración del susto (cuadros) y cantidad de parpadeos al final.
  const SUSTO = [6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1];
  PP.tiempoSusto = (nivel) => (nivel <= 18 ? SUSTO[nivel - 1] : 0) * 60;
  PP.parpadeosSusto = (nivel) => (PP.tiempoSusto(nivel) === 60 ? 3 : 5);
  PP.CUADROS_PARPADEO = 14;

  // "Cruise Elroy": Fuego acelera cuando quedan pocas hojuelas.
  // d1/d2: hojuelas restantes para cada etapa; v1/v2: velocidad.
  PP.elroy = function (nivel) {
    const t = (d1, v1, v2) => ({ d1, v1, d2: d1 / 2, v2 });
    if (nivel === 1) return t(20, 0.80, 0.85);
    if (nivel === 2) return t(30, 0.90, 0.95);
    if (nivel <= 4) return t(40, 0.90, 0.95);
    if (nivel === 5) return t(40, 1.00, 1.05);
    if (nivel <= 8) return t(50, 1.00, 1.05);
    if (nivel <= 11) return t(60, 1.00, 1.05);
    if (nivel <= 14) return t(80, 1.00, 1.05);
    if (nivel <= 18) return t(100, 1.00, 1.05);
    return t(120, 1.00, 1.05);
  };

  // Salida de la casa: hojuelas que espera cada fantasma (contador propio).
  PP.limiteCasa = function (id, nivel) {
    if (id === 'nino') return 0;
    if (id === 'coco') return nivel === 1 ? 30 : 0;
    if (id === 'canto') return nivel === 1 ? 60 : nivel === 2 ? 50 : 0;
    return 0;
  };
  // Tras perder una vida se usa un contador global.
  PP.LIMITE_GLOBAL = { nino: 7, coco: 17, canto: 32 };
  // Frutas bonus: aparecen bajo la casa al comer 70 y 170 ítems.
  PP.FRUTAS = {
    cancha: { nombre: 'Cancha', puntos: 100 },
    haba: { nombre: 'Haba', puntos: 300 },
    yuca: { nombre: 'Yuca', puntos: 500 },
    camote: { nombre: 'Camote', puntos: 700 },
    platano: { nombre: 'Plátano', puntos: 1000 },
    taro: { nombre: 'Taro', puntos: 2000 },
    choclo: { nombre: 'Choclo', puntos: 3000 },
    papa: { nombre: 'Papa nativa', puntos: 5000 },
  };
  const FRUTA_POR_NIVEL = ['cancha', 'haba', 'yuca', 'yuca', 'camote', 'camote', 'platano', 'platano',
    'taro', 'taro', 'choclo', 'choclo'];
  PP.frutaDelNivel = (nivel) => FRUTA_POR_NIVEL[nivel - 1] || 'papa';
  PP.FRUTA_CASILLA = { y: 17, x: [13, 14] };
  PP.FRUTA_APARECE = [70, 170];

  // Intermedios: escena que se muestra al terminar cada nivel indicado.
  PP.ESCENA_TRAS_NIVEL = { 2: 1, 5: 2, 9: 3, 13: 3, 17: 3 };
  PP.DURACION_ESCENA = { 1: 540, 2: 420, 3: 380 };

  // Si Pac-Papa no come, sale el siguiente fantasma tras este tiempo.
  PP.limiteSinComer = (nivel) => (nivel < 5 ? 4 : 3) * 60;
})(window.PP);
