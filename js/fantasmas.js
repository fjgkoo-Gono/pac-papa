'use strict';
// Fantasmas con la lógica del original.
//
//  - Avanzan píxel a píxel. Al llegar al centro de una casilla toman la
//    dirección que ya habían decidido y deciden la de la casilla siguiente
//    (miran una casilla hacia adelante).
//  - En cada decisión eligen la salida (sin dar media vuelta) que deja su
//    casilla objetivo más cerca en línea recta. Empates: arriba > izquierda
//    > abajo > derecha.
//  - En 4 casillas no pueden girar hacia arriba (salvo asustados u ojos).
//  - Asustados eligen al azar.
//
// Estados: casa (rebotando), saliendo, afuera, ojos (comidos, vuelven a
// casa) y entrando (los ojos bajan a la casa y reviven).
(function (PP) {
  const T = PP.TILE;
  const D = PP.DIR;
  const ORDEN = [D.UP, D.LEFT, D.DOWN, D.RIGHT];
  const ANCHO_TUNEL = (PP.COLS + 2) * T;

  // Posiciones en la casa (píxeles del laberinto).
  const PUERTA_X = 14 * T;          // entre las columnas 13 y 14
  const AFUERA_Y = 11 * T + T / 2;  // fila justo encima de la puerta
  const CASA_Y = 14 * T + T / 2;    // centro de la casa
  const CASA_ARRIBA = CASA_Y - 4;
  const CASA_ABAJO = CASA_Y + 4;

  const SIN_SUBIR = new Set(['12,11', '15,11', '12,23', '15,23']);

  PP.DEFINICION_FANTASMAS = [
    { id: 'fuego', nombre: 'Golpe de Calor', esquina: { x: 25, y: -3 }, inicio: { x: PUERTA_X, y: AFUERA_Y, dir: D.LEFT, estado: 'afuera' } },
    { id: 'nino', nombre: 'El Niño', esquina: { x: 2, y: -3 }, inicio: { x: PUERTA_X, y: CASA_Y, dir: D.DOWN, estado: 'casa' } },
    { id: 'coco', nombre: 'Coco', esquina: { x: 27, y: 32 }, inicio: { x: PUERTA_X - 2 * T, y: CASA_Y, dir: D.UP, estado: 'casa' } },
    { id: 'canto', nombre: 'Canto rodado', esquina: { x: 0, y: 32 }, inicio: { x: PUERTA_X + 2 * T, y: CASA_Y, dir: D.UP, estado: 'casa' } },
  ];

  class Fantasma {
    constructor(juego, def) {
      this.juego = juego;
      this.lab = juego.lab;
      this.id = def.id;
      this.nombre = def.nombre;
      this.esquina = def.esquina;
      this.inicio = def.inicio;
      this.contador = 0;      // hojuelas contadas en la casa
      this.reiniciar();
    }

    reiniciar() {
      const i = this.inicio;
      this.x = i.x;
      this.y = i.y;
      this.dir = i.dir;
      this.estado = i.estado;
      this.asustado = false;
      this.invertir = false;
      this.acumulado = 0;
      this.distancia = 0;
      this.plan = null;
      if (this.estado === 'afuera') this.planear();
    }

    get tx() { return Math.floor(this.x / T); }
    get ty() { return Math.floor(this.y / T); }

    enTunel() {
      return this.ty === PP.TUNEL_FILA && (this.tx <= 5 || this.tx >= 22);
    }

    // Casilla objetivo según el modo y la personalidad.
    objetivo() {
      const j = this.juego;
      const pac = j.pac;
      const ptx = Math.floor(pac.x / T), pty = Math.floor(pac.y / T);
      const d = pac.dir === D.NONE ? D.LEFT : pac.dir;
      const enfurecido = this.id === 'fuego' && j.nivelElroy() > 0;

      if (j.modo === 'dispersion' && !enfurecido) return this.esquina;

      // Casilla n pasos delante de Pac-Papa, con el error del original:
      // si mira hacia arriba, también se corre n casillas a la izquierda.
      const delante = (n) => ({
        x: ptx + d.x * n - (d === D.UP ? n : 0),
        y: pty + d.y * n,
      });

      switch (this.id) {
        case 'fuego':
          return { x: ptx, y: pty };
        case 'nino':
          return delante(4);
        case 'coco': {
          const a = delante(2);
          const f = j.fantasma('fuego');
          return { x: 2 * a.x - f.tx, y: 2 * a.y - f.ty };
        }
        case 'canto': {
          const dx = this.tx - ptx, dy = this.ty - pty;
          return dx * dx + dy * dy > 64 ? { x: ptx, y: pty } : this.esquina;
        }
      }
      return { x: ptx, y: pty };
    }

    // Dirección a tomar al llegar al centro de (tx, ty), viniendo en `llegada`.
    decidir(tx, ty, llegada) {
      const prohibida = PP.opuesta(llegada);
      const libreArriba = this.asustado || this.estado === 'ojos' || !SIN_SUBIR.has(`${tx},${ty}`);
      const validas = ORDEN.filter((o) =>
        o !== prohibida && this.lab.libre(tx + o.x, ty + o.y) && (o !== D.UP || libreArriba));
      if (validas.length === 0) return prohibida;

      if (this.asustado && this.estado === 'afuera') {
        const inicio = Math.floor(Math.random() * 4);
        for (let k = 0; k < 4; k++) {
          const o = ORDEN[(inicio + k) % 4];
          if (validas.includes(o)) return o;
        }
      }

      const meta = this.estado === 'ojos' ? { x: 13, y: 11 } : this.objetivo();
      let mejor = validas[0], mejorDist = Infinity;
      for (const o of validas) {
        const dx = tx + o.x - meta.x, dy = ty + o.y - meta.y;
        const dist = dx * dx + dy * dy;
        if (dist < mejorDist) {
          mejor = o;
          mejorDist = dist;
        }
      }
      return mejor;
    }

    // Decide qué hacer en el próximo centro de casilla que alcanzará.
    planear() {
      let tx = this.tx, ty = this.ty;
      const cx = tx * T + T / 2, cy = ty * T + T / 2;
      const d = this.dir;
      const haciaCentro = d.x !== 0 ? (cx - this.x) * d.x >= 0 : (cy - this.y) * d.y >= 0;
      if (!haciaCentro) {
        tx += d.x;
        ty += d.y;
      }
      this.plan = this.decidir(tx, ty, d);
    }

    velocidad() {
      const j = this.juego;
      const v = PP.velocidades(j.nivel);
      if (this.estado === 'ojos' || this.estado === 'entrando') return PP.VELOCIDAD_OJOS;
      if (this.estado === 'casa' || this.estado === 'saliendo') return PP.VELOCIDAD_CASA;
      if (this.enTunel()) return v.tunel;
      if (this.asustado) return v.fantasmaAsustado;
      if (this.id === 'fuego') {
        const nivelElroy = j.nivelElroy();
        if (nivelElroy > 0) {
          const e = PP.elroy(j.nivel);
          return nivelElroy === 2 ? e.v2 : e.v1;
        }
      }
      return v.fantasma;
    }

    actualizar() {
      this.acumulado += PP.SPEED_100 * this.velocidad();
      const pasos = Math.floor(this.acumulado);
      this.acumulado -= pasos;
      for (let i = 0; i < pasos; i++) this.paso();
    }

    paso() {
      this.distancia++;
      switch (this.estado) {
        case 'casa': return this.pasoCasa();
        case 'saliendo': return this.pasoSaliendo();
        case 'entrando': return this.pasoEntrando();
        default: return this.pasoLaberinto();
      }
    }

    // Rebota arriba y abajo dentro de la casa.
    pasoCasa() {
      if (this.y <= CASA_ARRIBA) this.dir = D.DOWN;
      else if (this.y >= CASA_ABAJO) this.dir = D.UP;
      this.y += this.dir.y;
    }

    // Al centro de la casa, luego a la puerta y hacia arriba.
    pasoSaliendo() {
      if (this.x !== PUERTA_X && this.y !== CASA_Y) {
        this.dir = this.y < CASA_Y ? D.DOWN : D.UP;
        this.y += this.dir.y;
      } else if (this.x !== PUERTA_X) {
        this.dir = this.x < PUERTA_X ? D.RIGHT : D.LEFT;
        this.x += this.dir.x;
      } else if (this.y > AFUERA_Y) {
        this.dir = D.UP;
        this.y--;
      } else {
        this.estado = 'afuera';
        this.dir = D.LEFT;
        this.planear();
      }
    }

    // Los ojos bajan al centro de la casa y el fantasma revive.
    pasoEntrando() {
      if (this.x !== PUERTA_X) {
        this.dir = this.x < PUERTA_X ? D.RIGHT : D.LEFT;
        this.x += this.dir.x;
      } else if (this.y < CASA_Y) {
        this.dir = D.DOWN;
        this.y++;
      } else {
        this.asustado = false;
        this.estado = 'saliendo';
      }
    }

    pasoLaberinto() {
      const tx = this.tx, ty = this.ty;
      if (this.x === tx * T + T / 2 && this.y === ty * T + T / 2) {
        if (this.estado === 'ojos' && ty === 11 && (tx === 13 || tx === 14)) {
          this.estado = 'entrando';
          return;
        }
        if (this.invertir) {
          this.invertir = false;
          this.dir = PP.opuesta(this.dir);
        } else if (this.plan) {
          this.dir = this.plan;
        }
        this.plan = this.decidir(tx + this.dir.x, ty + this.dir.y, this.dir);
      }
      this.x += this.dir.x;
      this.y += this.dir.y;
      if (this.x < -T) this.x += ANCHO_TUNEL;
      else if (this.x >= PP.WIDTH + T) this.x -= ANCHO_TUNEL;
    }
  }

  PP.Fantasma = Fantasma;
})(window.PP);
