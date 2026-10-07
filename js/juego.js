'use strict';
// Estado de la partida: puntaje, récord, vidas, niveles, modos de los
// fantasmas, susto, salida de la casa y choques.
//
// Estados:
//   titulo        pantalla de título (una tecla o toque empieza)
//   listo         "¡LISTO!" antes de jugar (con música de inicio al empezar)
//   jugando       partida en curso
//   comiendo      pausa breve al comer un fantasma (se muestra el puntaje)
//   muriendo      Pac-Papa atrapado: pausa y animación de muerte
//   nivelCompleto pausa y parpadeo del laberinto antes del siguiente nivel
//   intermedio    escena cómica entre niveles (como en el original)
//   gameOver      fin de la partida (una tecla empieza otra; luego vuelve al título)
(function (PP) {
  const PUNTOS_HOJUELA = 10;
  const PUNTOS_BOLSA = 50;
  const VIDA_EXTRA = 10000;
  const CLAVE_RECORD = 'pacpapa.record';

  // Duraciones en cuadros (60 por segundo).
  const DURACION_LISTO = 120;
  const DURACION_INTRO = 255;       // con la música de inicio, como el original
  const PAUSA_FIN_NIVEL = 60;
  const PARPADEOS_FIN_NIVEL = 8;
  const CUADROS_POR_PARPADEO = 12;
  const PAUSA_COMER_FANTASMA = 60;
  const PAUSA_MUERTE = 60;
  const ANIMACION_MUERTE = 90;
  const FIN_MUERTE = PAUSA_MUERTE + ANIMACION_MUERTE + 30;
  const GAME_OVER_A_TITULO = 600;

  function leerRecord() {
    try {
      return Number(localStorage.getItem(CLAVE_RECORD)) || 0;
    } catch {
      return 0;
    }
  }

  function guardarRecord(valor) {
    try {
      localStorage.setItem(CLAVE_RECORD, String(valor));
    } catch {
      // Sin almacenamiento: el récord dura solo esta sesión.
    }
  }

  class Juego {
    constructor() {
      this.lab = new PP.Laberinto();
      this.pac = new PP.PacPapa(this.lab);
      this.fantasmas = PP.DEFINICION_FANTASMAS.map((def) => new PP.Fantasma(this, def));
      this.record = leerRecord();
      this.pausa = false;
      this.eventos = [];             // sonidos pendientes para el audio
      this.nuevaPartida();
      this.irATitulo();
    }

    irATitulo() {
      this.estado = 'titulo';
      this.tiempo = 0;
    }

    nuevaPartida() {
      this.eventos = [];
      this.nivel = 1;
      this.toneladas = 0;
      this.vidas = 2;              // vidas de reserva (3 en total)
      this.vidaExtraDada = false;
      this.cuadro = 0;
      this.lab.reiniciar();
      this.empezarNivel();
      this.entrarListo(true);
    }

    // Comienzo de nivel: contadores propios de la casa en cero.
    empezarNivel() {
      for (const f of this.fantasmas) f.contador = 0;
      this.usarContadorGlobal = false;
      this.elroySuspendido = false;
      this.reiniciarPosiciones();
    }

    // Comienzo de nivel o de vida: actores a su lugar y ciclo de modos de cero.
    reiniciarPosiciones() {
      this.pac.reiniciar();
      for (const f of this.fantasmas) f.reiniciar();
      this.modo = 'dispersion';
      this.faseModo = 0;
      this.tiempoModo = 0;
      this.susto = 0;
      this.fantasmasComidos = 0;
      this.sinComer = 0;
      this.contadorGlobal = 0;
      this.puntosFlotantes = null;
      this.fruta = null;          // { tipo, restante } bajo la casa
      this.puntosFruta = null;    // { puntos, restante } tras comerla
    }

    entrarListo(conIntro = false) {
      this.estado = 'listo';
      this.conIntro = conIntro;
      this.tiempo = 0;
    }

    emitir(sonido) {
      this.eventos.push(sonido);
    }

    fantasma(id) {
      return this.fantasmas.find((f) => f.id === id);
    }

    pedir(dir) {
      if (this.estado === 'titulo' || (this.estado === 'gameOver' && this.tiempo > 60)) {
        this.nuevaPartida();
        this.pac.pedir(dir);
        return;
      }
      // Los intermedios se pueden saltar.
      if (this.estado === 'intermedio') {
        if (this.tiempo > 30) this.tiempo = PP.DURACION_ESCENA[this.escena];
        return;
      }
      this.pac.pedir(dir);
    }

    // Toque sin deslizar: empieza desde el título o salta un intermedio.
    tocar() {
      if (this.estado === 'titulo' || this.estado === 'gameOver' || this.estado === 'intermedio') {
        this.pedir(this.pac.deseo);
      }
    }

    alternarPausa() {
      if (['titulo', 'gameOver', 'intermedio'].includes(this.estado)) return;
      this.pausa = !this.pausa;
    }

    actualizar() {
      if (this.pausa) return;
      this.cuadro++;
      this.tiempo++;
      switch (this.estado) {
        case 'listo':
          if (this.tiempo >= (this.conIntro ? DURACION_INTRO : DURACION_LISTO)) {
            this.estado = 'jugando';
            this.conIntro = false;
          }
          break;
        case 'jugando':
          this.jugar();
          break;
        case 'comiendo':
          // Los ojos que ya volvían siguen su camino durante la pausa.
          for (const f of this.fantasmas) {
            if ((f.estado === 'ojos' || f.estado === 'entrando') && f !== this.puntosFlotantes.fantasma) f.actualizar();
          }
          if (this.tiempo >= PAUSA_COMER_FANTASMA) {
            this.puntosFlotantes = null;
            this.estado = 'jugando';
          }
          break;
        case 'muriendo':
          if (this.tiempo === PAUSA_MUERTE) this.emitir('muerte');
          if (this.tiempo >= FIN_MUERTE) this.despuesDeMorir();
          break;
        case 'nivelCompleto':
          if (this.tiempo >= PAUSA_FIN_NIVEL + PARPADEOS_FIN_NIVEL * CUADROS_POR_PARPADEO) {
            const escena = PP.ESCENA_TRAS_NIVEL[this.nivel];
            if (escena) {
              this.estado = 'intermedio';
              this.escena = escena;
              this.tiempo = 0;
            } else {
              this.siguienteNivel();
            }
          }
          break;
        case 'intermedio':
          if (this.tiempo >= PP.DURACION_ESCENA[this.escena]) this.siguienteNivel();
          break;
        case 'gameOver':
          if (this.tiempo >= GAME_OVER_A_TITULO) this.irATitulo();
          break;
      }
    }

    jugar() {
      this.actualizarFruta();
      const pac = this.pac;
      const v = PP.velocidades(this.nivel);
      pac.actualizar(this.susto > 0 ? v.pacAsustando : v.pac);

      const c = this.lab.comer(Math.floor(pac.x / PP.TILE), Math.floor(pac.y / PP.TILE));
      if (c) this.comio(c);
      this.revisarFruta();
      if (this.lab.restantes === 0) {
        this.estado = 'nivelCompleto';
        this.tiempo = 0;
        return;
      }
      if (this.revisarChoques()) return;

      this.actualizarModo();
      this.actualizarSusto();
      this.liberarFantasmas();
      for (const f of this.fantasmas) f.actualizar();
      this.revisarChoques();
    }

    comio(c) {
      const pac = this.pac;
      this.sinComer = 0;
      const comidos = this.lab.total - this.lab.restantes;
      if (PP.FRUTA_APARECE.includes(comidos)) {
        // Entre 9 y 10 segundos, como en el original.
        this.fruta = { tipo: PP.frutaDelNivel(this.nivel), restante: 570 + Math.floor(Math.random() * 30) };
      }
      this.contarHojuelaCasa();
      if (c === '.') {
        this.sumar(PUNTOS_HOJUELA);
        pac.congelado = 1;
        this.emitir('hojuela');
      } else {
        this.sumar(PUNTOS_BOLSA);
        this.emitir('bolsa');
        pac.congelado = 3;
        this.asustarFantasmas();
      }
    }

    // ----- Frutas -----

    actualizarFruta() {
      if (this.fruta && --this.fruta.restante <= 0) this.fruta = null;
      if (this.puntosFruta && --this.puntosFruta.restante <= 0) this.puntosFruta = null;
    }

    revisarFruta() {
      if (!this.fruta) return;
      const tx = Math.floor(this.pac.x / PP.TILE), ty = Math.floor(this.pac.y / PP.TILE);
      if (ty !== PP.FRUTA_CASILLA.y || !PP.FRUTA_CASILLA.x.includes(tx)) return;
      const puntos = PP.FRUTAS[this.fruta.tipo].puntos;
      this.sumar(puntos);
      this.puntosFruta = { puntos, restante: 120 };
      this.emitir('fruta');
      this.fruta = null;
    }

    // Frutas de los últimos 7 niveles, de la más antigua a la actual.
    get frutasRecientes() {
      const lista = [];
      for (let n = Math.max(1, this.nivel - 6); n <= this.nivel; n++) lista.push(PP.frutaDelNivel(n));
      return lista;
    }

    // ----- Modos -----

    actualizarModo() {
      if (this.susto > 0) return;      // el reloj se detiene durante el susto
      const tabla = PP.tablaModos(this.nivel);
      if (this.faseModo >= tabla.length) return;
      this.tiempoModo++;
      if (this.tiempoModo >= tabla[this.faseModo]) {
        this.faseModo++;
        this.tiempoModo = 0;
        this.modo = this.faseModo % 2 === 0 ? 'dispersion' : 'persecucion';
        for (const f of this.fantasmas) if (f.estado === 'afuera') f.invertir = true;
      }
    }

    // ----- Susto -----

    asustarFantasmas() {
      const duracion = PP.tiempoSusto(this.nivel);
      this.fantasmasComidos = 0;
      for (const f of this.fantasmas) {
        if (f.estado === 'afuera') f.invertir = true;
        if (duracion > 0 && f.estado !== 'ojos' && f.estado !== 'entrando') f.asustado = true;
      }
      this.susto = duracion;
    }

    actualizarSusto() {
      if (this.susto <= 0) return;
      this.susto--;
      if (this.susto === 0) for (const f of this.fantasmas) f.asustado = false;
    }

    // Parpadeo blanco al final del susto.
    get sustoParpadea() {
      const limite = PP.parpadeosSusto(this.nivel) * PP.CUADROS_PARPADEO;
      return this.susto > 0 && this.susto <= limite && Math.floor(this.susto / (PP.CUADROS_PARPADEO / 2)) % 2 === 0;
    }

    // ----- Elroy -----

    nivelElroy() {
      if (this.elroySuspendido) {
        if (this.fantasma('canto').estado === 'casa') return 0;
        this.elroySuspendido = false;
      }
      const e = PP.elroy(this.nivel);
      if (this.lab.restantes <= e.d2) return 2;
      if (this.lab.restantes <= e.d1) return 1;
      return 0;
    }

    // ----- Casa de los fantasmas -----

    fantasmaPreferido() {
      return ['nino', 'coco', 'canto'].map((id) => this.fantasma(id)).find((f) => f.estado === 'casa');
    }

    contarHojuelaCasa() {
      if (this.usarContadorGlobal) {
        this.contadorGlobal++;
        for (const [id, limite] of Object.entries(PP.LIMITE_GLOBAL)) {
          const f = this.fantasma(id);
          if (this.contadorGlobal === limite && f.estado === 'casa') {
            f.estado = 'saliendo';
            if (id === 'canto') this.usarContadorGlobal = false;
          }
        }
        return;
      }
      const f = this.fantasmaPreferido();
      if (f) f.contador++;
    }

    liberarFantasmas() {
      this.sinComer++;
      const f = this.fantasmaPreferido();
      if (!f) return;
      if (!this.usarContadorGlobal && f.contador >= PP.limiteCasa(f.id, this.nivel)) {
        f.estado = 'saliendo';
      } else if (this.sinComer >= PP.limiteSinComer(this.nivel)) {
        f.estado = 'saliendo';
        this.sinComer = 0;
      }
    }

    // ----- Choques -----

    revisarChoques() {
      const ptx = Math.floor(this.pac.x / PP.TILE), pty = Math.floor(this.pac.y / PP.TILE);
      for (const f of this.fantasmas) {
        if (f.estado !== 'afuera' || f.tx !== ptx || f.ty !== pty) continue;
        if (f.asustado) {
          this.comerFantasma(f);
        } else {
          this.estado = 'muriendo';
          this.tiempo = 0;
        }
        return true;
      }
      return false;
    }

    comerFantasma(f) {
      this.fantasmasComidos++;
      const puntos = 200 * 2 ** (this.fantasmasComidos - 1);
      this.sumar(puntos);
      this.emitir('fantasma');
      f.estado = 'ojos';
      f.asustado = false;
      f.invertir = false;
      this.puntosFlotantes = { x: f.x, y: f.y, puntos, fantasma: f };
      this.estado = 'comiendo';
      this.tiempo = 0;
    }

    despuesDeMorir() {
      if (this.vidas === 0) {
        this.estado = 'gameOver';
        this.tiempo = 0;
        return;
      }
      this.vidas--;
      this.reiniciarPosiciones();
      this.usarContadorGlobal = true;
      this.elroySuspendido = true;
      this.entrarListo();
    }

    // Avance de la animación de muerte (0 a 1), o null si no corresponde.
    get progresoMuerte() {
      if (this.estado !== 'muriendo' || this.tiempo < PAUSA_MUERTE) return null;
      return Math.min(1, (this.tiempo - PAUSA_MUERTE) / ANIMACION_MUERTE);
    }

    // ----- Puntaje y niveles -----

    sumar(puntos) {
      this.toneladas += puntos;
      if (!this.vidaExtraDada && this.toneladas >= VIDA_EXTRA) {
        this.vidaExtraDada = true;
        this.vidas++;
        this.emitir('vida');
      }
      if (this.toneladas > this.record) {
        this.record = this.toneladas;
        guardarRecord(this.record);
      }
    }

    siguienteNivel() {
      this.nivel++;
      this.lab.reiniciar();
      this.empezarNivel();
      this.entrarListo();
    }

    // Qué se ve en pantalla.
    get pacVisible() {
      if (this.estado === 'comiendo') return false;
      if (this.estado === 'muriendo') return this.tiempo < FIN_MUERTE - 30;
      return this.estado !== 'gameOver';
    }

    get fantasmasVisibles() {
      if (this.estado === 'muriendo') return this.tiempo < PAUSA_MUERTE;
      if (this.estado === 'nivelCompleto') return this.tiempo < PAUSA_FIN_NIVEL;
      return this.estado !== 'gameOver';
    }

    // Parpadeo del laberinto al completar el nivel.
    get laberintoIluminado() {
      if (this.estado !== 'nivelCompleto' || this.tiempo < PAUSA_FIN_NIVEL) return false;
      return Math.floor((this.tiempo - PAUSA_FIN_NIVEL) / CUADROS_POR_PARPADEO) % 2 === 0;
    }
  }

  PP.Juego = Juego;
})(window.PP);
