'use strict';
// Pac-Papa: movimiento píxel a píxel como en el original.
//  - Guarda la dirección pedida y gira apenas puede (pre-turn).
//  - Cornering: puede girar en cualquier punto de la casilla si la
//    casilla vecina está libre; avanza en diagonal hasta centrarse.
//  - Se detiene en el centro de la casilla cuando hay un muro delante.
(function (PP) {
  const T = PP.TILE;
  const D = PP.DIR;
  // Período horizontal del túnel: 28 casillas visibles + 2 ocultas.
  const ANCHO_TUNEL = (PP.COLS + 2) * T;

  class PacPapa {
    constructor(laberinto) {
      this.lab = laberinto;
      this.reiniciar();
    }

    reiniciar() {
      // Posición de salida: entre las columnas 13 y 14, fila 23.
      this.x = 14 * T;
      this.y = 23 * T + T / 2;
      this.dir = D.LEFT;
      this.deseo = D.LEFT;
      this.mirada = -1;          // -1 izquierda, 1 derecha (adornos)
      this.acumulado = 0;        // fracción de píxel pendiente
      this.distancia = 0;        // píxeles recorridos (anima la boca)
      this.parado = false;
      this.quieto = true;        // antes del primer movimiento
      this.congelado = 0;        // cuadros detenido tras comer
    }

    pedir(dir) {
      this.deseo = dir;
    }

    // Avanza un cuadro (1/60 s) a la velocidad dada (fracción).
    // Como en el original, comer una hojuela detiene a Pac-Papa 1 cuadro
    // y una bolsa, 3 cuadros.
    actualizar(velocidad) {
      if (this.congelado > 0) {
        this.congelado--;
        return;
      }
      this.acumulado += PP.SPEED_100 * velocidad;
      const pasos = Math.floor(this.acumulado);
      this.acumulado -= pasos;
      for (let i = 0; i < pasos; i++) this.paso();
    }

    paso() {
      const tx = Math.floor(this.x / T);
      const ty = Math.floor(this.y / T);
      const cx = tx * T + T / 2;
      const cy = ty * T + T / 2;

      const w = this.deseo;
      if (w !== D.NONE && w !== this.dir) {
        if (w === PP.opuesta(this.dir) || this.lab.libre(tx + w.x, ty + w.y)) {
          this.dir = w;
        }
      }

      const d = this.dir;
      if (d.x !== 0) {
        if (this.x === cx && !this.lab.libre(tx + d.x, ty)) {
          this.parado = true;
          return;
        }
        this.x += d.x;
        if (this.y < cy) this.y++;
        else if (this.y > cy) this.y--;
        this.mirada = d.x;
      } else if (d.y !== 0) {
        if (this.y === cy && !this.lab.libre(tx, ty + d.y)) {
          this.parado = true;
          return;
        }
        this.y += d.y;
        if (this.x < cx) this.x++;
        else if (this.x > cx) this.x--;
      } else {
        return;
      }

      this.parado = false;
      this.quieto = false;
      this.distancia++;

      // Túnel: sale por un lado y entra por el otro.
      if (this.x < -T) this.x += ANCHO_TUNEL;
      else if (this.x >= PP.WIDTH + T) this.x -= ANCHO_TUNEL;
    }

    // Medio ángulo de apertura de la boca, en radianes.
    get boca() {
      if (this.quieto) return 0;
      const fase = (this.distancia % 16) / 16;
      const tri = 1 - Math.abs(fase * 2 - 1);
      return 0.06 + tri * 0.72;
    }
  }

  PP.PacPapa = PacPapa;
})(window.PP);
