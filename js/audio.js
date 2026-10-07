'use strict';
// Sonido de Pac-Papa (Web Audio API).
//
// Música: para cada momento busca un archivo en musica/ (por ejemplo, tus
// canciones de Los Mirlos). Si no existe, toca una cumbia amazónica
// original generada por código: guitarra con trémolo y eco, bajo, güiro,
// campana, timbales y bombo.
//
//   musica/inicio.mp3      al empezar la partida (se corta a los ~4 s)
//   musica/juego.mp3       durante el juego, en bucle
//   musica/asustado.mp3    mientras los fantasmas están asustados, en bucle
//   musica/intermedio.mp3  en los intermedios, en bucle
//
// Efectos (todos originales): crujido de hojuela, bolsa abierta, fantasma
// comido, ojos volviendo a casa, fruta, vida extra y muerte.
(function (PP) {
  const RANURAS = ['inicio', 'juego', 'asustado', 'intermedio'];
  const CLAVE_SILENCIO = 'pacpapa.silencio';
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

  // ---------- Canciones originales (pasos de semicorchea, 16 por compás) ----------

  const ACORDES = {
    Am: { notas: [57, 60, 64], raiz: 45 },
    G: { notas: [55, 59, 62], raiz: 43 },
    F: { notas: [53, 57, 60], raiz: 41 },
    E: { notas: [52, 56, 59], raiz: 40 },
  };

  // Base de cumbia para un compás: bajo, güiro (largo-corto-corto),
  // campana y rasgueo en los contratiempos, bombo en 1 y 3.
  function baseCumbia(acorde, compas, eventos, { relleno = false } = {}) {
    const a = ACORDES[acorde];
    const p = compas * 16;
    eventos.push({ paso: p, inst: 'bajo', nota: a.raiz, dur: 4 });
    eventos.push({ paso: p + 8, inst: 'bajo', nota: a.raiz + 7, dur: 3 });
    eventos.push({ paso: p + 12, inst: 'bajo', nota: a.raiz + 12, dur: 2 });
    for (let b = 0; b < 4; b++) {
      eventos.push({ paso: p + b * 4, inst: 'guiroLargo' });
      eventos.push({ paso: p + b * 4 + 2, inst: 'guiroCorto' });
      eventos.push({ paso: p + b * 4 + 3, inst: 'guiroCorto' });
      eventos.push({ paso: p + b * 4 + 2, inst: 'campana' });
      eventos.push({ paso: p + b * 4 + 2, inst: 'rasgueo', notas: a.notas });
    }
    eventos.push({ paso: p, inst: 'bombo' });
    eventos.push({ paso: p + 8, inst: 'bombo' });
    if (relleno) for (let s = 12; s < 16; s++) eventos.push({ paso: p + s, inst: 'timbal', nota: s % 2 ? 1 : 0 });
  }

  function melodia(compases, eventos, notas) {
    notas.forEach((compas, i) => {
      for (const [paso, nota, dur] of compas) eventos.push({ paso: compases[i] * 16 + paso, inst: 'guitarra', nota, dur });
    });
  }

  function cancionJuego() {
    const eventos = [];
    const acordes = ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'];
    acordes.forEach((a, i) => baseCumbia(a, i, eventos, { relleno: i === 3 || i === 7 }));
    melodia([0, 1, 2, 3, 4, 5, 6, 7], eventos, [
      [[0, 76, 3], [3, 74, 3], [6, 72, 2], [8, 69, 4], [12, 72, 2], [14, 74, 2]],
      [[0, 74, 3], [3, 72, 3], [6, 71, 2], [8, 67, 6], [14, 71, 2]],
      [[0, 72, 3], [3, 71, 3], [6, 69, 2], [8, 65, 4], [12, 69, 2], [14, 72, 2]],
      [[0, 71, 4], [4, 68, 4], [8, 64, 6], [14, 68, 2]],
      [[0, 81, 2], [2, 79, 2], [4, 76, 4], [8, 79, 2], [10, 76, 2], [12, 74, 4]],
      [[0, 79, 2], [2, 76, 2], [4, 74, 4], [8, 76, 2], [10, 74, 2], [12, 71, 4]],
      [[0, 77, 2], [2, 76, 2], [4, 74, 2], [6, 72, 2], [8, 74, 4], [12, 72, 2], [14, 71, 2]],
      [[0, 68, 2], [2, 71, 2], [4, 74, 2], [6, 71, 2], [8, 69, 8]],
    ]);
    return { bpm: 98, pasos: 8 * 16, eventos };
  }

  // Susto: frigio, más rápido, guitarra nerviosa.
  function cancionAsustado() {
    const eventos = [];
    baseCumbia('E', 0, eventos);
    baseCumbia('F', 1, eventos, { relleno: true });
    const a = [76, 77, 76, 74, 76, 77, 79, 77];
    const b = [77, 79, 77, 76, 74, 72, 71, 68];
    a.forEach((n, i) => eventos.push({ paso: i * 2, inst: 'guitarra', nota: n, dur: 2 }));
    b.forEach((n, i) => eventos.push({ paso: 16 + i * 2, inst: 'guitarra', nota: n, dur: 2 }));
    return { bpm: 128, pasos: 32, eventos };
  }

  // Inicio: fanfarria de dos compases que termina en La menor.
  function cancionInicio() {
    const eventos = [];
    baseCumbia('Am', 0, eventos);
    eventos.push({ paso: 16, inst: 'bajo', nota: 45, dur: 8 });
    eventos.push({ paso: 16, inst: 'bombo' });
    eventos.push({ paso: 16, inst: 'rasgueo', notas: ACORDES.Am.notas, largo: true });
    for (let s = 24; s < 32; s++) eventos.push({ paso: s, inst: 'timbal', nota: s % 2 ? 1 : 0 });
    melodia([0, 1], eventos, [
      [[0, 69, 2], [2, 72, 2], [4, 76, 2], [6, 81, 4], [10, 79, 2], [12, 76, 2], [14, 79, 2]],
      [[0, 81, 8]],
    ]);
    return { bpm: 120, pasos: 32, eventos, unaVez: true };
  }

  // ---------- Motor ----------

  class Audio {
    constructor() {
      this.ctx = null;
      this.archivos = {};       // ranura -> AudioBuffer de musica/
      this.actual = null;       // ranura sonando
      this.fuente = null;       // AudioBufferSourceNode de un archivo
      this.secuencia = null;    // canción sintetizada sonando
      this.ritmo = 1;
      this.alternar = false;    // crujido alterno, como el "waka-waka"
      this.ojos = null;
      try {
        this.silencio = localStorage.getItem(CLAVE_SILENCIO) === '1';
      } catch {
        this.silencio = false;
      }
    }

    // Debe llamarse desde un gesto del usuario (tecla o toque).
    desbloquear() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.maestro = ctx.createGain();
      this.maestro.gain.value = this.silencio ? 0 : 1;
      this.maestro.connect(ctx.destination);
      this.musica = ctx.createGain();
      this.musica.gain.value = 0.26;
      this.musica.connect(this.maestro);
      this.efectos = ctx.createGain();
      this.efectos.gain.value = 0.55;
      this.efectos.connect(this.maestro);

      // Eco psicodélico para la guitarra.
      this.eco = ctx.createDelay(1);
      this.eco.delayTime.value = 0.29;
      const realimentacion = ctx.createGain();
      realimentacion.gain.value = 0.32;
      const salidaEco = ctx.createGain();
      salidaEco.gain.value = 0.35;
      this.eco.connect(realimentacion).connect(this.eco);
      this.eco.connect(salidaEco).connect(this.musica);

      // Ruido blanco para güiro, crujidos y bolsa.
      const largo = ctx.sampleRate;
      this.ruido = ctx.createBuffer(1, largo, ctx.sampleRate);
      const datos = this.ruido.getChannelData(0);
      for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;

      this.canciones = { juego: cancionJuego(), asustado: cancionAsustado(), inicio: cancionInicio() };
      this.canciones.intermedio = this.canciones.juego;
      this.cargarArchivos();
    }

    async cargarArchivos() {
      if (location.protocol === 'file:') return;   // sin servidor no se pueden leer
      for (const r of RANURAS) {
        try {
          const resp = await fetch(`musica/${r}.mp3`);
          if (!resp.ok) continue;
          this.archivos[r] = await this.ctx.decodeAudioData(await resp.arrayBuffer());
          // Si esa música ya sonaba sintetizada, pasar al archivo.
          if (this.actual === r) {
            this.actual = null;
          }
        } catch {
          // Sin archivo o formato no soportado: queda la música original.
        }
      }
    }

    alternarSilencio() {
      this.silencio = !this.silencio;
      try {
        localStorage.setItem(CLAVE_SILENCIO, this.silencio ? '1' : '0');
      } catch {
        // Sin almacenamiento: dura solo esta sesión.
      }
      if (this.maestro) this.maestro.gain.setTargetAtTime(this.silencio ? 0 : 1, this.ctx.currentTime, 0.02);
    }

    // ---------- Música ----------

    tocarMusica(ranura) {
      this.detenerMusica();
      this.actual = ranura;
      if (!ranura) return;
      const ctx = this.ctx;
      const buffer = this.archivos[ranura];
      if (buffer) {
        const f = (this.fuente = ctx.createBufferSource());
        f.buffer = buffer;
        f.loop = ranura !== 'inicio';
        const g = (f.ganancia = ctx.createGain());
        g.connect(this.musica);
        f.connect(g);
        if (ranura === 'inicio') {
          // Se corta suave a los 4 segundos, cuando termina el "¡LISTO!".
          g.gain.setValueAtTime(1, ctx.currentTime + 3.6);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.2);
        }
        f.start();
        return;
      }
      const cancion = this.canciones[ranura];
      const porPaso = new Map();
      for (const e of cancion.eventos) {
        if (!porPaso.has(e.paso)) porPaso.set(e.paso, []);
        porPaso.get(e.paso).push(e);
      }
      this.secuencia = { cancion, porPaso, paso: 0, siguiente: ctx.currentTime + 0.06 };
      this.temporizador = setInterval(() => this.programar(), 25);
    }

    detenerMusica() {
      if (this.fuente) {
        const g = this.fuente.ganancia.gain;
        g.cancelScheduledValues(this.ctx.currentTime);
        g.setTargetAtTime(0, this.ctx.currentTime, 0.03);
        this.fuente.stop(this.ctx.currentTime + 0.2);
        this.fuente = null;
      }
      clearInterval(this.temporizador);
      this.secuencia = null;
    }

    // Programa las notas que caen en los próximos 120 ms.
    programar() {
      const s = this.secuencia;
      if (!s) return;
      const ctx = this.ctx;
      const c = s.cancion;
      const dur = 60 / (c.bpm * this.ritmo) / 4;
      // Si el temporizador se atrasó (pestaña en segundo plano, equipo
      // lento), saltar lo perdido en vez de tocar notas ya vencidas.
      if (s.siguiente < ctx.currentTime) s.siguiente = ctx.currentTime + 0.02;
      while (s.siguiente < ctx.currentTime + 0.12) {
        for (const e of s.porPaso.get(s.paso) || []) this.tocarNota(e, s.siguiente, dur);
        s.siguiente += dur;
        s.paso++;
        if (s.paso >= c.pasos) {
          if (c.unaVez) {
            clearInterval(this.temporizador);
            this.secuencia = null;
            return;
          }
          s.paso = 0;
        }
      }
    }

    tocarNota(e, t, dur) {
      switch (e.inst) {
        case 'guitarra': return this.guitarra(t, e.nota, e.dur * dur);
        case 'rasgueo': return this.rasgueo(t, e.notas, e.largo ? 1.2 : 0.09);
        case 'bajo': return this.bajo(t, e.nota, e.dur * dur);
        case 'guiroLargo': return this.ruidoFiltrado(t, 0.11, 4200, 0.16, 38, this.musica);
        case 'guiroCorto': return this.ruidoFiltrado(t, 0.035, 5200, 0.12, 0, this.musica);
        case 'campana': return this.campana(t);
        case 'timbal': return this.timbal(t, e.nota);
        case 'bombo': return this.bombo(t);
      }
    }

    // ---------- Instrumentos ----------

    envolvente(t, pico, ataque, duracion, destino) {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(pico, t + ataque);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      g.connect(destino);
      return g;
    }

    osc(tipo, frec, t, fin, destino) {
      const o = this.ctx.createOscillator();
      o.type = tipo;
      o.frequency.setValueAtTime(frec, t);
      o.connect(destino);
      o.start(t);
      o.stop(fin);
      return o;
    }

    // Oscilador lento que modula un parámetro (trémolo, vibrato).
    lfo(tipo, frec, profundidad, param, t, fin) {
      const o = this.ctx.createOscillator();
      o.type = tipo;
      o.frequency.value = frec;
      const g = this.ctx.createGain();
      g.gain.value = profundidad;
      o.connect(g).connect(param);
      o.start(t);
      o.stop(fin);
    }

    // Guitarra eléctrica con trémolo, al estilo de la cumbia amazónica.
    guitarra(t, nota, duracion) {
      const ctx = this.ctx;
      const fin = t + duracion + 0.15;
      const env = this.envolvente(t, 0.22, 0.006, duracion + 0.12, this.musica);
      env.connect(this.eco);
      const trem = ctx.createGain();
      trem.gain.value = 0.6;
      trem.connect(env);
      this.lfo('sine', 7.5, 0.4, trem.gain, t, fin);
      const filtro = ctx.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.setValueAtTime(2600, t);
      filtro.frequency.exponentialRampToValueAtTime(1300, t + duracion + 0.1);
      filtro.Q.value = 4;
      filtro.connect(trem);
      const o1 = this.osc('square', hz(nota), t, fin, filtro);
      const o2 = this.osc('sawtooth', hz(nota) * 1.004, t, fin, filtro);
      // Vibrato leve.
      this.lfo('sine', 5.5, hz(nota) * 0.006, o1.frequency, t, fin);
      this.lfo('sine', 5.5, hz(nota) * 0.006, o2.frequency, t, fin);
    }

    rasgueo(t, notas, duracion) {
      const filtro = this.ctx.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.value = 1500;
      filtro.Q.value = 0.7;
      const env = this.envolvente(t, 0.09, 0.003, duracion, this.musica);
      filtro.connect(env);
      notas.forEach((n, i) => this.osc('square', hz(n + 12), t + i * 0.008, t + duracion + 0.05, filtro));
    }

    bajo(t, nota, duracion) {
      const filtro = this.ctx.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = 700;
      const env = this.envolvente(t, 0.5, 0.01, Math.min(duracion, 0.45), this.musica);
      filtro.connect(env);
      this.osc('triangle', hz(nota), t, t + duracion + 0.05, filtro);
      this.osc('sine', hz(nota), t, t + duracion + 0.05, filtro);
    }

    // Ruido filtrado: güiro (con raspado si `raspado` > 0), crujidos.
    ruidoFiltrado(t, duracion, frec, pico, raspado, destino, velocidad = 1) {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.ruido;
      src.playbackRate.value = velocidad;
      const filtro = ctx.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.value = frec;
      filtro.Q.value = 1.2;
      const env = this.envolvente(t, pico, 0.004, duracion, destino);
      if (raspado) {
        const am = ctx.createGain();
        am.gain.value = 0.5;
        this.lfo('sine', raspado, 0.5, am.gain, t, t + duracion + 0.02);
        src.connect(filtro).connect(am).connect(env);
      } else {
        src.connect(filtro).connect(env);
      }
      src.start(t, Math.random() * 0.5);
      src.stop(t + duracion + 0.02);
    }

    campana(t) {
      const filtro = this.ctx.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.value = 900;
      filtro.Q.value = 3;
      const env = this.envolvente(t, 0.07, 0.002, 0.12, this.musica);
      filtro.connect(env);
      this.osc('square', 560, t, t + 0.14, filtro);
      this.osc('square', 845, t, t + 0.14, filtro);
    }

    timbal(t, agudo) {
      const env = this.envolvente(t, 0.28, 0.002, 0.16, this.musica);
      const o = this.osc('sine', agudo ? 520 : 390, t, t + 0.18, env);
      o.frequency.exponentialRampToValueAtTime(agudo ? 420 : 300, t + 0.15);
      this.ruidoFiltrado(t, 0.05, 3000, 0.12, 0, this.musica);
    }

    bombo(t) {
      const env = this.envolvente(t, 0.6, 0.002, 0.2, this.musica);
      const o = this.osc('sine', 120, t, t + 0.22, env);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    }

    // ---------- Efectos ----------

    efecto(nombre) {
      const ctx = this.ctx;
      const t = ctx.currentTime + 0.005;
      const fx = this.efectos;
      switch (nombre) {
        case 'hojuela': {
          // Crujido de papa frita; alterna dos tonos como el "waka-waka".
          this.alternar = !this.alternar;
          const frec = this.alternar ? 2600 : 3900;
          this.ruidoFiltrado(t, 0.05, frec, 1.0, 0, fx, 0.9 + Math.random() * 0.3);
          this.ruidoFiltrado(t + 0.025, 0.03, frec * 1.4, 0.6, 0, fx, 1.2);
          break;
        }
        case 'bolsa': {
          // Plástico arrugado y el "pop" al abrirla.
          for (let i = 0; i < 10; i++) {
            this.ruidoFiltrado(t + i * 0.022 + Math.random() * 0.01, 0.03, 5000 + Math.random() * 3000, 0.25, 0, fx);
          }
          const env = this.envolvente(t + 0.24, 0.5, 0.003, 0.12, fx);
          const o = this.osc('sine', 320, t + 0.24, t + 0.4, env);
          o.frequency.exponentialRampToValueAtTime(110, t + 0.36);
          break;
        }
        case 'fantasma': {
          const env = this.envolvente(t, 0.22, 0.01, 0.5, fx);
          const o = this.osc('square', 220, t, t + 0.55, env);
          o.frequency.exponentialRampToValueAtTime(1500, t + 0.45);
          break;
        }
        case 'fruta':
          [72, 76, 79, 84].forEach((n, i) => this.pulsar(t + i * 0.07, n, 0.18));
          break;
        case 'vida':
          for (let r = 0; r < 3; r++) [84, 88, 91].forEach((n, i) => this.pulsar(t + r * 0.3 + i * 0.07, n, 0.16));
          break;
        case 'muerte': {
          // Guitarra que cae, como en el original.
          const env = this.envolvente(t, 0.25, 0.01, 1.3, fx);
          const o = this.osc('sawtooth', 880, t, t + 1.35, env);
          o.frequency.exponentialRampToValueAtTime(110, t + 1.25);
          this.lfo('sine', 9, 30, o.frequency, t, t + 1.35);
          this.pulsar(t + 1.35, 45, 0.15);
          this.pulsar(t + 1.5, 45, 0.15);
          break;
        }
      }
    }

    pulsar(t, nota, duracion) {
      const env = this.envolvente(t, 0.25, 0.004, duracion, this.efectos);
      this.osc('triangle', hz(nota), t, t + duracion + 0.05, env);
      this.osc('square', hz(nota) * 2, t, t + duracion + 0.05, this.envolvente(t, 0.05, 0.004, duracion, this.efectos));
    }

    // Sonido continuo de los ojos volviendo a casa.
    sonarOjos(activo) {
      const ctx = this.ctx;
      if (activo && !this.ojos) {
        const g = ctx.createGain();
        g.gain.value = 0.06;
        g.connect(this.efectos);
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = 900;
        const lfo = ctx.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.value = 7;
        const prof = ctx.createGain();
        prof.gain.value = 350;
        lfo.connect(prof).connect(o.frequency);
        o.connect(g);
        o.start();
        lfo.start();
        this.ojos = { o, lfo, g };
      } else if (!activo && this.ojos) {
        this.ojos.o.stop();
        this.ojos.lfo.stop();
        this.ojos.g.disconnect();
        this.ojos = null;
      }
    }

    // ---------- Sincronía con el juego (cada cuadro) ----------

    actualizar(juego) {
      if (!this.ctx) {
        juego.eventos.length = 0;
        return;
      }
      if (juego.pausa) {
        if (this.ctx.state === 'running') this.ctx.suspend();
        return;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();

      for (const e of juego.eventos) this.efecto(e);
      juego.eventos.length = 0;

      let deseada = null;
      if (juego.estado === 'listo' && juego.conIntro) deseada = 'inicio';
      else if (juego.estado === 'intermedio') deseada = 'intermedio';
      else if (juego.estado === 'jugando' || juego.estado === 'comiendo') deseada = juego.susto > 0 ? 'asustado' : 'juego';
      if (deseada !== this.actual) this.tocarMusica(deseada);

      // Como la sirena del original: más rápido cuando quedan pocas hojuelas.
      const avance = 1 - juego.lab.restantes / juego.lab.total;
      this.ritmo = deseada === 'juego' ? 1 + 0.12 * avance : 1;
      if (this.fuente && deseada === 'juego') this.fuente.playbackRate.value = 1 + 0.05 * avance;

      const hayOjos = juego.estado === 'jugando' && juego.fantasmas.some((f) => f.estado === 'ojos' || f.estado === 'entrando');
      this.sonarOjos(hayOjos);
    }
  }

  PP.audio = new Audio();
})(window.PP);
