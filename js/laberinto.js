'use strict';
// Mapa del laberinto original (28 × 31).
//   #  muro de piedra      .  hojuela      o  bolsa de Inkachips
//   -  puerta de la casa   (espacio) pasillo sin hojuela
// Las zonas cerradas a los lados del túnel se rellenan de piedra.
(function (PP) {
  PP.MAPA = [
    '############################',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#o####.#####.##.#####.####o#',
    '#.####.#####.##.#####.####.#',
    '#..........................#',
    '#.####.##.########.##.####.#',
    '#.####.##.########.##.####.#',
    '#......##....##....##......#',
    '######.##### ## #####.######',
    '######.##### ## #####.######',
    '######.##          ##.######',
    '######.## ###--### ##.######',
    '######.## #      # ##.######',
    '      .   #      #   .      ',
    '######.## #      # ##.######',
    '######.## ######## ##.######',
    '######.##          ##.######',
    '######.## ######## ##.######',
    '######.## ######## ##.######',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#.####.#####.##.#####.####.#',
    '#o..##.......  .......##..o#',
    '###.##.##.########.##.##.###',
    '###.##.##.########.##.##.###',
    '#......##....##....##......#',
    '#.##########.##.##########.#',
    '#.##########.##.##########.#',
    '#..........................#',
    '############################',
  ];

  class Laberinto {
    constructor() {
      this.reiniciar();
    }

    reiniciar() {
      this.celdas = PP.MAPA.map((fila) => fila.split(''));
      this.restantes = 0;
      for (const fila of this.celdas) {
        for (const c of fila) if (c === '.' || c === 'o') this.restantes++;
      }
      this.total = this.restantes;
      this.comidas = [];   // casillas comidas pendientes de borrar en pantalla
      this.version = (this.version || 0) + 1;
    }

    // Come lo que haya en la casilla. Devuelve '.', 'o' o null.
    comer(tx, ty) {
      const c = this.get(tx, ty);
      if (c !== '.' && c !== 'o') return null;
      this.celdas[ty][tx] = ' ';
      this.restantes--;
      this.comidas.push({ tx, ty });
      return c;
    }

    // Sabor de la bolsa según la esquina.
    saborBolsa(tx, ty) {
      const arriba = ty < PP.MAZE_ROWS / 2;
      const izquierda = tx < PP.COLS / 2;
      if (arriba) return izquierda ? 'salado' : 'jalapeno';
      return izquierda ? 'bbq' : 'queso';
    }

    // Fuera de los bordes solo existe el túnel.
    get(tx, ty) {
      if (ty < 0 || ty >= PP.MAZE_ROWS) return '#';
      if (tx < 0 || tx >= PP.COLS) return ty === PP.TUNEL_FILA ? ' ' : '#';
      return this.celdas[ty][tx];
    }

    // Casilla por la que puede pasar Pac-Papa.
    libre(tx, ty) {
      const c = this.get(tx, ty);
      return c !== '#' && c !== '-';
    }

    // Casilla sólida para el dibujo (muro o puerta).
    solida(tx, ty) {
      const c = this.get(tx, ty);
      return c === '#' || c === '-';
    }
  }

  PP.Laberinto = Laberinto;
})(window.PP);
