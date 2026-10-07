'use strict';
// Utilidades compartidas.
(function (PP) {
  // Generador pseudoaleatorio con semilla (mulberry32): el laberinto
  // se dibuja igual en cada partida.
  PP.rng = function (semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Formato peruano: punto de miles.
  PP.formatoToneladas = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' T';
  };
})(window.PP);
